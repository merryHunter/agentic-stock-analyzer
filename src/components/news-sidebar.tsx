// src/components/news-sidebar.tsx
"use client";
import React, { useEffect, useState } from 'react';

interface NewsArticle {
  headline: string;
  ticker: string;
  url: string;
  media_source: string;
  movement: number;
}

interface NewsSidebarProps {
  selectedTicker: string;
}

const NewsSidebar: React.FC<NewsSidebarProps> = ({ selectedTicker }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;
        const response = await fetch(`${backendHost}/api/news/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Default filter: can be connected to state later
            ticker: selectedTicker,
            period_start: "2025-07-20",
            period_end: "2025-07-28",
          }),
        });
        const data = await response.json();
        setNews(data.news);
      } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback to mock data for demo
        setNews([
          {
            headline: "AAPL Q4 Earnings Beat Expectations",
            ticker: "AAPL",
            url: "https://www.reuters.com/business/apple-earnings",
            media_source: "Reuters",
            movement: 2.34
          },
          {
            headline: "Fed Signals Potential Rate Hikes",
            ticker: "SPY",
            url: "https://www.bloomberg.com/news/fed-rate-hikes",
            media_source: "Bloomberg",
            movement: -1.2
          },
          {
            headline: "TSLA Unveils New Battery Technology",
            ticker: "TSLA",
            url: "https://techcrunch.com/tesla-battery-tech",
            media_source: "TechCrunch",
            movement: 5.67
          },
          {
            headline: "Market Volatility Expected This Week",
            ticker: "VIX",
            url: "https://www.marketwatch.com/market-volatility",
            media_source: "MarketWatch",
            movement: 0.0
          },
          {
            headline: "NVDA AI Chip Demand Surges",
            ticker: "NVDA",
            url: "https://www.cnbc.com/nvidia-ai-chips",
            media_source: "CNBC",
            movement: 8.9
          }
        ]);
      }
    };

    fetchNews();
  }, [selectedTicker]);

  const getPrediction = (movement: number) => {
    if (movement > 2) return { label: "BULLISH", class: "bullish" };
    if (movement < -2) return { label: "BEARISH", class: "bearish" };
    return { label: "NEUTRAL", class: "neutral" };
  };

  const getTimeAgo = (index: number) => {
    const times = ["2 minutes ago", "15 minutes ago", "32 minutes ago", "1 hour ago", "1 hour ago"];
    return times[index % times.length];
  };

  return (
    <div className="panel news-panel" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="panel-header">
        <svg className="icon" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h3a1 1 0 110 2H7a1 1 0 01-1-1z"/>
        </svg>
        <h2>Market News & Predictions</h2>
      </div>
      
      {news.map((article, index) => {
        const prediction = getPrediction(article.movement);
        return (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="news-item" style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 1)';
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{getTimeAgo(index)}</div>
                <div className={`prediction ${prediction.class}`} style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  ...(prediction.class === 'bullish' && {
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }),
                  ...(prediction.class === 'bearish' && {
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }),
                  ...(prediction.class === 'neutral' && {
                    background: 'rgba(100, 116, 139, 0.2)',
                    color: '#64748b',
                    border: '1px solid rgba(100, 116, 139, 0.3)'
                  })
                }}>
                  {prediction.label}
                </div>
              </div>
              <div style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>
                {article.headline}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {article.media_source} ({article.ticker}) - {Math.abs(article.movement)}% movement expected
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default NewsSidebar; 