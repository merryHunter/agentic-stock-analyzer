from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from our Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/news")
def get_news():
    # Sample news data
    news_data = [
        {"id": 1, "title": "Big Tech Stocks Rally on Positive Earnings", "source": "TechCrunch"},
        {"id": 2, "title": "Market Volatility Increases Amidst Economic Uncertainty", "source": "Reuters"},
        {"id": 3, "title": "New Innovations in Green Energy Boost Sector Stocks", "source": "Bloomberg"},
    ]
    return {"news": news_data} 