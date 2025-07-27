import logging
import warnings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime, timezone
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv
import os
from langchain_core.messages import HumanMessage, AIMessage
import requests
import numpy as np
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

np.random.seed(42)

# Suppress the duckduckgo_search package rename warning
warnings.filterwarnings("ignore", message="This package \\(`duckduckgo_search`\\) has been renamed to `ddgs`!", category=RuntimeWarning)

load_dotenv()

from chat_logic import graph
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=[
        "http://localhost:3000"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Bodies ---

class NewsFilter(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    media_sources: Optional[List[str]] = None

class TickerFilter(BaseModel):
    ticker: str
    period_start: date
    period_end: date
    interval: str = "1d"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class PricePrediction(BaseModel):
    summary: str = Field(description="A summary of the news analysis and price prediction.")
    overall_change: float = Field(description="The estimated stock price change value in points (e.g. -5.3, 12.1, -7.8, 0.3).")

class MovementPrediction(BaseModel):
    movement: float = Field(description="The estimated stock price change based on a single news article, as a percentage change (e.g. -1.5, 2.0, 0.0).")

# --- API Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/api/news/search")
async def search_news(filter: NewsFilter):
    # In a real application, you would use these filters to query a database.
    # For now, we'll just return some sample data that matches the structure.
    # sample_news = [
    #     {
    #         "headline": "Tesla investors are growing wary of Elon Musk’s futuristic promises",
    #         "ticker": "TSLA",
    #         "published_at": "2025-07-26T09:00:00Z",
    #         "updated_at": "2025-07-27T10:00:00Z",
    #         "content": "At Tesla , vehicle sales are slumping...",
    #         "url": "https://www.cnbc.com/2025/07/26/tesla-investors-grow-wary-of-elon-musk-robotaxi-promises.html",
    #         "media_source": "CNBC",
    #         "impact_score": 96,
    #         "movement": -10.0
    #     }
    # ]
    # return {"news": sample_news}
    try:
        news = await get_news_for_ticker_newsapi(filter.ticker, filter.company_name)
        print(f'Found {len(news)} news articles for {filter.ticker}')
    except Exception as e:
        print(f"Error fetching news for {filter.ticker}: {e}")
        return {"news": [], "summary": "No news found to analyze.", "overall_change": 0}
    
    
    if news:
        try:
            analysis = await analyze_news_with_llm(news, filter.ticker, filter.company_name)
            return {"news": news, "summary": analysis.get('summary'), "overall_change": analysis.get('overall_change')}
        except Exception as e:
            logging.error(f"Error analyzing news with LLM: {e}")
            return {"news": news, "summary": "Could not analyze news.", "overall_change": 0}
    else:
        return {"news": [], "summary": "No news found to analyze.", "overall_change": 0}


@app.post("/api/tickers/search")
def search_tickers(filter: TickerFilter):
    try:
        # Download data from yfinance
        dat = yf.Ticker(filter.ticker)
        data = dat.history(period='1mo')

        if data.empty:
            return {"ticker_data": []}

        # 1. If columns are a MultiIndex, flatten them by taking the first level.
        # This handles cases where columns are like ('Close', 'AAPL')
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        # 2. Reset the DatetimeIndex to turn it into a 'Date' or 'Datetime' column.
        data = data.reset_index()
        # 3. Standardize all column names to lowercase.
        data.columns = [col.lower() for col in data.columns]
        
        # 4. Rename the date column to 'timestamp'. It could be 'date' or 'datetime'.
        data = data.rename(columns={"date": "timestamp"})

        # 5. Format the timestamp column to 'YYYY-MM-DD'.
        data['timestamp'] = pd.to_datetime(data['timestamp']).dt.strftime('%Y-%m-%d')
        # 6. Ensure only the required columns are present and in order.
        required_columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        data = data[required_columns]
        # todo: filter based on filter.period_start and filter.period_end ?
        # data = data[data['timestamp'] >= filter.period_start and data['timestamp'] <= filter.period_end]
        # 7. Convert to a list of dictionaries for a clean JSON response.
        records = data.to_dict(orient='records')
        
        return {"ticker_data": records}

    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail=str(e)) 
    

async def analyze_article_movement(headline: str, content: str) -> float:
    """
    Analyzes a single news article to estimate stock price movement.
    """
    gpt_model_name = os.getenv("OPENAI_PRICE_MODEL", "gpt-3.5-turbo")
    model = ChatOpenAI(model=gpt_model_name)
    parser = JsonOutputParser(pydantic_object=MovementPrediction)

    prompt = PromptTemplate(
        template="""
            You are a financial analyst. Based on the following news article, predict the likely stock price change in points for tomorrow OPENING PRICE.
            Provide only the estimated stock price change in points (e.g. -5.5, 12.2, 6.7). Be bold and confident in your prediction.

            Headline: {headline}
            Content: {content}

            Return your answer in the following JSON format:
            {format_instructions}
        """,
        input_variables=["headline", "content"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | model | parser
    try:
        result = await chain.ainvoke({"headline": headline, "content": content})
        return result.get("movement", 0.0)
    except Exception as e:
        logger.error(f"Error analyzing article movement: {e}")
        return 0.0


async def analyze_news_with_llm(news: List[dict], ticker: str, company_name: str):
    # Format the news for the prompt
    formatted_news = "\n".join([f"- {item['headline']}: {item['content']}" for item in news if item['headline'] and item['content']])

    # Setup the model and parser
    gpt_model_name = os.getenv("OPENAI_PRICE_MODEL", "o3-mini")
    model = ChatOpenAI(model=gpt_model_name)
    parser = JsonOutputParser(pydantic_object=PricePrediction)

    prompt = PromptTemplate(
        template="""
            You are a financial analyst. Based on the following news articles for {ticker} ({company_name}), predict the stock price change for tomorrow OPENING PRICE.
            Provide a summary of your analysis and an estimated ticker price change in points (e.g. -5.3, 12.1, -7.8, 0.3). Indicate two main arguments for your prediction.

            News Articles:
            {news}

            Return your answer in the following JSON format:
            {format_instructions}
        """,
        input_variables=["ticker", "company_name", "news"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    # Create the chain and invoke it
    chain = prompt | model | parser
    try:
        result = await chain.ainvoke({"ticker": ticker, "company_name": company_name, "news": formatted_news})
        return result
    except Exception as e:
        print(f"Error analyzing news with LLM: {e}")
        # Return a default/error response
        return {"summary":"Could not analyze news.", "overall_change":0}


@app.post("/api/chat")
async def chat(chat_request: ChatRequest):
    try:
        # Convert the incoming messages to the format LangChain expects
        messages = []
        for msg in chat_request.messages:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:  # role is 'bot' or 'assistant'
                messages.append(AIMessage(content=msg.content))
        
        state = {"messages": messages}

        async def event_stream():
            # Use the astream_events method to get real-time events
            async for event in graph.astream_events(state, version="v1"):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        yield f"data: {content}\n\n"
        
        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail=str(e))


def format_time_from_now(published_at_str: Optional[str]) -> str:
    """
    Calculates the time difference between a given ISO format datetime string and now,
    and returns it in a human-readable format.
    """
    if not published_at_str:
        return "unknown"

    try:
        # Parse the ISO 8601 format string. Replace 'Z' with '+00:00' for compatibility.
        if published_at_str.endswith('Z'):
            published_at = datetime.fromisoformat(published_at_str[:-1] + '+00:00')
        else:
            published_at = datetime.fromisoformat(published_at_str)

        # Ensure the datetime is timezone-aware (assume UTC if not specified)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)

    except (ValueError, TypeError):
        return "Invalid date format"

    now = datetime.now(timezone.utc)
    delta = now - published_at

    seconds = int(delta.total_seconds())

    if seconds < 0:
        return "in the future"
    elif seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = seconds // 86400
        return f"{days} day{'s' if days > 1 else ''} ago"


async def get_news_for_ticker_newsapi(ticker, company_name=None):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("NEWS_API_KEY not found in environment variables.")
        return []

    query = f'"{ticker}" OR "{company_name}"' if company_name else f'"{ticker}"'
    url = f"https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "language": "en",
        "apiKey": api_key,
        "pageSize": 10
    }
    try:
        resp = requests.get(url, params=params)
        data = resp.json()
        print(data)
    except Exception as e:
        print(f"Error fetching news for {ticker}: {e}")
        return []
    
    articles = data.get("articles", [])
    if not articles:
        return []

    async def process_article(article):
        if article.get("title") and article.get("description"):
            movement = await analyze_article_movement(article.get("title"), article.get("description"))
            return {
                "headline": article.get("title"),
                "url": article.get("url"),
                "published_at": article.get("publishedAt"),
                "media_source": article.get("source", {}).get("name"),
                "content": article.get("description"),
                "impact_score": 0,
                "time_from_now": format_time_from_now(article.get("publishedAt")),
                "movement": movement
            }
        return None

    tasks = [process_article(article) for article in articles if article.get("title") and article.get("url")]
    processed_articles = await asyncio.gather(*tasks)
    
    return [p for p in processed_articles if p is not None]

