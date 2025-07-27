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

const NewsSidebar = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/news/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Default filter: can be connected to state later
            period_start: "2025-07-20",
            period_end: "2025-07-28",
          }),
        });
        const data = await response.json();
        setNews(data.news);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">News</h2>
      <ul>
        {news.map((article, index) => (
          <li key={index} className="mb-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              <h3 className="font-semibold">{article.headline}</h3>
            </a>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{article.media_source} ({article.ticker})</span>
              <span className={article.movement < 0 ? 'text-red-500' : 'text-green-500'}>
                {article.movement}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default NewsSidebar; 