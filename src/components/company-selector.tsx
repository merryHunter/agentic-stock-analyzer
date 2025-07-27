"use client";
import React from 'react';

const popularTickers = ["NVDA", "MSFT", "AAPL", "AMZN", "META", "AVGO", "GOOGL", "GOOG", "BRK.B", "TSLA", "JPM", "WMT", "LLY", "V", "ORCL", "MA", "NFLX", "XOM", "COST", "JNJ", "PLTR", "HD", "PG", "BAC", "ABBV", "CVX", "KO", "GE", "TMUS", "CSCO", "WFC", "AMD", "CRM", "UNH", "PM", "IBM", "MS", "GS", "LIN", "ABT", "INTU", "DIS", "AXP", "MCD", "MRK", "RTX", "CAT", "NOW", "T", "PEP"];

interface CompanySelectorProps {
  onTickerSelect: (ticker: string) => void;
  selectedTicker: string;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ onTickerSelect, selectedTicker }) => {
  return (
    <div>
      <label htmlFor="ticker-select" style={{ 
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        border: 0
      }}>
        Select a stock ticker
      </label>
      <select
        id="ticker-select"
        value={selectedTicker}
        onChange={(e) => onTickerSelect(e.target.value)}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          color: '#f1f5f9',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
          e.currentTarget.style.background = 'rgba(15, 23, 42, 1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
        }}
      >
        <option value="" disabled style={{ background: 'rgba(15, 23, 42, 1)', color: '#94a3b8' }}>
          Select a ticker
        </option>
        {popularTickers.map(ticker => (
          <option 
            key={ticker} 
            value={ticker}
            style={{ background: 'rgba(15, 23, 42, 1)', color: '#f1f5f9' }}
          >
            {ticker}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompanySelector; 