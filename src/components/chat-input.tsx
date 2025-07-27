"use client";
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        display: 'flex',
        gap: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '8px',
        padding: '10px'
      }}>
        <input
          type="text"
          placeholder={isLoading ? "AI is typing..." : "Ask about stocks, trends, analysis..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f1f5f9',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          style={{
            background: isLoading || !text.trim() 
              ? 'rgba(100, 116, 139, 0.3)' 
              : 'linear-gradient(135deg, #64748b, #475569)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#f1f5f9',
            cursor: isLoading || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && text.trim()) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #475569, #334155)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && text.trim()) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #64748b, #475569)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 