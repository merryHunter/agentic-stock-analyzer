"use client";
import NewsSidebar from "@/components/news-sidebar";
import ChatSidebar from "@/components/chat-sidebar";
import MainView from "@/components/main-view";
import { useState, useEffect } from "react";
import { NewsArticle } from "@/lib/definitions";
import { getCompanyNameFromTicker, popularTickers } from "@/lib/ticker-utils";


const getRandomTicker = () => {
  return popularTickers[Math.floor(Math.random() * popularTickers.length)];
};

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [overallChange, setOverallChange] = useState<number>(0);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);


  useEffect(() => {
    // Select a random ticker only on the initial load
    if (!selectedTicker) {
      setSelectedTicker(getRandomTicker());
    }
  }, []);

  useEffect(() => {
    if (!selectedTicker) return;

    const fetchNewsData = async () => {
      setIsNewsLoading(true);
      try {
        const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;
        const companyName = getCompanyNameFromTicker(selectedTicker);
        const response = await fetch(`${backendHost}/api/news/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker: selectedTicker, company_name: companyName }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data.news);
        setSummary(data.summary);
        setOverallChange(data.overall_change);

      } catch (err) {
        console.error("Failed to fetch news data:", err);
      } finally {
        setIsNewsLoading(false);
      }
    };

    fetchNewsData();
  }, [selectedTicker]);

  return (
    <div className="dashboard">
      <NewsSidebar 
        selectedTicker={selectedTicker}
        news={news}
        isLoading={isNewsLoading}
      />
      <MainView 
        selectedTicker={selectedTicker} 
        onTickerSelect={setSelectedTicker}
        summary={summary}
        overallChange={overallChange}
      />
      <ChatSidebar />
    </div>
  );
}
