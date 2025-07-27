"use client";
import React from 'react';

const popularTickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META"];

interface CompanySelectorProps {
  onTickerSelect: (ticker: string) => void;
  selectedTicker: string;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ onTickerSelect, selectedTicker }) => {
  return (
    <div className="mb-4">
      <label htmlFor="ticker-select" className="sr-only">Select a stock ticker</label>
      <select
        id="ticker-select"
        value={selectedTicker}
        onChange={(e) => onTickerSelect(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="" disabled>Select a ticker</option>
        {popularTickers.map(ticker => (
          <option key={ticker} value={ticker}>{ticker}</option>
        ))}
      </select>
    </div>
  );
};

export default CompanySelector; 