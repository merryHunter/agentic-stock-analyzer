import json
import warnings
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv
import os
from langchain_core.messages import HumanMessage, AIMessage
import requests

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
    period_start: str
    period_end: str
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
    news = get_news_for_ticker_newsapi(filter.ticker)
    print(f'Found {len(news)} news articles for {filter.ticker}')
    return {"news": news}


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
        print(e)
        raise HTTPException(status_code=500, detail=str(e)) 
    

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
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


def get_news_for_ticker_newsapi(ticker):
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("NEWS_API_KEY not found in environment variables.")
        return []

    url = f"https://newsapi.org/v2/everything"
    params = {
        "q": ticker,
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
    return [
        {
            "headline": article["title"],
            "url": article["url"],
            "published_at": article["publishedAt"],
            "media_source": article["source"]["name"],
            "content": article["description"],
            "impact_score": 0,
            "movement": 10
        }
        for article in data.get("articles", [])
    ]

# Example usage:
# news = get_news_for_ticker_newsapi("AAPL", "YOUR_NEWSAPI_KEY")
# for n in news:
#     print(n["headline"], n["url"])

