// src/components/news-sidebar.tsx
"use client";
import React from 'react';
import { NewsArticle } from '@/lib/definitions';
import { LoadingSpinner } from './loading-spinner';

interface NewsSidebarProps {
  selectedTicker: string;
  news: NewsArticle[];
  isLoading: boolean;
}

const NewsSidebar: React.FC<NewsSidebarProps> = ({ selectedTicker, news, isLoading }) => {
  const getPrediction = (movement: number) => {
    if (movement > 2) return { label: "BULLISH", class: "bullish" };
    if (movement < -2) return { label: "BEARISH", class: "bearish" };
    return { label: "NEUTRAL", class: "neutral" };
  };

  return (
    <div className="panel news-panel" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="panel-header">
        <svg className="icon" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h3a1 1 0 110 2H7a1 1 0 01-1-1z"/>
        </svg>
        <h2>Market News & Predictions</h2>
      </div>

      <div style={{ position: 'relative' }}>
        {isLoading && news.length === 0 && <LoadingSpinner />}
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
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{article.time_from_now}</div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                    {article.media_source}
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: article.movement > 0 ? 'rgba(34, 197, 94, 0.2)' : article.movement < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: article.movement > 0 ? '#22c55e' : article.movement < 0 ? '#ef4444' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {article.movement > 0 ? '▲' : article.movement < 0 ? '▼' : ''}
                    {article.movement !== 0 ? Math.abs(article.movement) : 'Neutral'}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default NewsSidebar; 