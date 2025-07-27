// src/components/main-view.tsx
"use client";
import React, { useState, useEffect } from 'react';
import CompanySelector from './company-selector';
import StockChart from './stock-chart';
import { LoadingSpinner } from './loading-spinner';

interface MainViewProps {
  selectedTicker: string;
  onTickerSelect: (ticker: string) => void;
  summary: string;
  overallChange: number;
  isNewsLoading: boolean;
}

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

const MainView: React.FC<MainViewProps> = ({ selectedTicker, onTickerSelect, summary, overallChange, isNewsLoading }) => {
  const [stockData, setStockData] = useState<StockDataPoint[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(185.47);
  const [priceChange, setPriceChange] = useState<number>(2.34);
  const [percentChange, setPercentChange] = useState<number>(1.28);

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
        
        // Update current price info from latest data
        if (data.ticker_data && data.ticker_data.length > 0) {
          const latest = data.ticker_data[data.ticker_data.length - 1];
          const previous = data.ticker_data[data.ticker_data.length - 2];
          setCurrentPrice(latest.close);
          if (previous) {
            const change = latest.close - previous.close;
            const percent = (change / previous.close) * 100;
            setPriceChange(change);
            setPercentChange(percent);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Use mock data for demo
        setStockData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [selectedTicker]);

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <div className="panel chart-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: '#f1f5f9', fontSize: '1.8rem', fontWeight: '700' }}>
              {selectedTicker}
            </div>
            <div style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: '600' }}>
              ${currentPrice.toFixed(2)}
            </div>
            <div style={{ 
              color: priceChange >= 0 ? '#22c55e' : '#ef4444', 
              fontSize: '1rem', 
              fontWeight: '500' 
            }}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)})
            </div>
          </div>
          {/* <div style={{ display: 'flex', gap: '10px' }}>
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setActiveTimeframe(timeframe)}
                style={{
                  background: activeTimeframe === timeframe ? 'rgba(100, 116, 139, 0.4)' : 'rgba(100, 116, 139, 0.2)',
                  border: `1px solid ${activeTimeframe === timeframe ? '#64748b' : 'rgba(100, 116, 139, 0.3)'}`,
                  color: activeTimeframe === timeframe ? '#f1f5f9' : '#94a3b8',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (activeTimeframe !== timeframe) {
                    e.currentTarget.style.background = 'rgba(100, 116, 139, 0.4)';
                    e.currentTarget.style.borderColor = '#64748b';
                    e.currentTarget.style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTimeframe !== timeframe) {
                    e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {timeframe}
              </button>
            ))}
          </div> */}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <CompanySelector onTickerSelect={onTickerSelect} selectedTicker={selectedTicker} />
        </div>

        <div style={{
          flex: 0.7,
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: '#94a3b8'
            }}>
              Loading chart data...
            </div>
          )}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: '#ef4444'
            }}>
              Error: {error}
            </div>
          )}
          {!isLoading && !error && <StockChart data={stockData} />}
        </div>

        <div className="llm-summary" style={{
          flex: 0.3,
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {isNewsLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>
                AI-Powered Summary
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '10px', flex: 1, overflowY: 'auto' }}>
                {summary || "No summary available."}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Predicted Price Change:</div>
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: overallChange > 0 ? 'rgba(34, 197, 94, 0.2)' : overallChange < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: overallChange > 0 ? '#22c55e' : overallChange < 0 ? '#ef4444' : '#64748b',
                }}>
                  {overallChange > 0 ? '▲' : overallChange < 0 ? '▼' : ''} {overallChange}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainView; 