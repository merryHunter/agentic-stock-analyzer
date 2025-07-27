# FastAPI backend for stock analysis

## Requirements

```bash
uv venv
uv pip install -r requirements.txt
```

## Running dev server

`uv run uvicorn main:app --reload`

## API Routes

The API uses a `POST` request with a JSON body for filtering to provide a flexible and powerful querying interface.

### News

-   **Endpoint**: `POST /api/news/search`
-   **Description**: Searches for news articles based on a set of filters.
-   **Request Body**:
    ```json
    {
      "tickers": ["TSLA", "AMZN"],
      "period_start": "2025-07-20",
      "period_end": "2025-07-27",
      "media_sources": ["CNBC", "Reuters"]
    }
    ```
-   **Sample Response**:
    ```json
    {
      "news": [
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
    }
    ```

### Tickers

-   **Endpoint**: `POST /api/tickers/search`
-   **Description**: Retrieves historical price data for a specific ticker.
-   **Request Body**:
    ```json
    {
      "ticker": "AAPL",
      "period_start": "2025-07-01",
      "period_end": "2025-07-27",
      "interval": "1d"
    }
    ```

### Chat

-   **Endpoint**: `POST /api/chat`
-   **Description**: Handles chat interactions with the AI assistant. (Details TBD)