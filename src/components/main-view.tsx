// src/components/main-view.tsx
"use client";
import React, { useState, useEffect } from 'react';
import CompanySelector from './company-selector';
import StockChart from './stock-chart';

interface StockDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const mockData: StockDataPoint[] = [
  { timestamp: '2024-07-01', open: 206.67, high: 210.19, low: 206.14, close: 207.82, volume: 78788900 },
  { timestamp: '2024-07-02', open: 208.91, high: 213.34, low: 208.14, close: 212.44, volume: 67941800 },
  { timestamp: '2024-07-03', open: 212.15, high: 214.65, low: 211.81, close: 213.55, volume: 34955800 },
  { timestamp: '2024-07-07', open: 212.68, high: 216.23, low: 208.80, close: 209.95, volume: 50229000 },
  { timestamp: '2024-07-08', open: 210.10, high: 211.43, low: 208.45, close: 210.01, volume: 42848900 },
];


const MainView = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>('AAPL');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    if (!selectedTicker) return;

    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST;
        const response = await fetch(`${backendHost}/api/tickers/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticker: selectedTicker,
            period_start: "2024-01-01", // Example start date
            period_end: new Date().toISOString().split('T')[0], // Today
            interval: "1d"
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const data = await response.json();
        setStockData(data.ticker_data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [selectedTicker]);
  

  return (
    <main className="w-1/2 p-4">
      <CompanySelector onTickerSelect={setSelectedTicker} selectedTicker={selectedTicker} />
      {isLoading && <div className="text-center">Loading chart data...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}
      {!isLoading && !error && <StockChart data={stockData} />}
    </main>
  );
};

export default MainView; 