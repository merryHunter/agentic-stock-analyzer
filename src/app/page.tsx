"use client";
import NewsSidebar from "@/components/news-sidebar";
import ChatSidebar from "@/components/chat-sidebar";
import MainView from "@/components/main-view";
import { useState } from "react";

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState<string>('AAPL');

  return (
    <div className="dashboard">
      <NewsSidebar selectedTicker={selectedTicker} />
      <MainView selectedTicker={selectedTicker} onTickerSelect={setSelectedTicker} />
      <ChatSidebar />
    </div>
  );
}
