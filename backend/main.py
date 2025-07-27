import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import yfinance as yf
import pandas as pd

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from our Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Bodies ---

class NewsFilter(BaseModel):
    tickers: Optional[List[str]] = None
    period_start: date
    period_end: date
    media_sources: Optional[List[str]] = None

class TickerFilter(BaseModel):
    ticker: str
    period_start: date
    period_end: date
    interval: str = "1d"


# --- API Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/news/search")
def search_news(filter: NewsFilter):
    # In a real application, you would use these filters to query a database.
    # For now, we'll just return some sample data that matches the structure.
    print(f"Searching for news with filter: {filter.dict()}")
    sample_news = [
        {
            "headline": "Tesla investors are growing wary of Elon Musk’s futuristic promises",
            "ticker": "TSLA",
            "published_at": "2025-07-26T09:00:00Z",
            "updated_at": "2025-07-27T10:00:00Z",
            "content": "At Tesla , vehicle sales are slumping...",
            "url": "https://www.cnbc.com/2025/07/26/tesla-investors-grow-wary-of-elon-musk-robotaxi-promises.html",
            "media_source": "CNBC",
            "impact_score": 96,
            "movement": -10.0
        }
    ]
    return {"news": sample_news}

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