// src/components/news-sidebar.tsx
"use client";
import React, { useEffect, useState } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  source: string;
}

const NewsSidebar = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/news');
        const data = await response.json();
        setNews(data.news);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <aside className="w-1/4 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">News</h2>
      <ul>
        {news.map((article) => (
          <li key={article.id} className="mb-2">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-sm text-gray-600">{article.source}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default NewsSidebar; 