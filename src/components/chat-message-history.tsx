"use client";
import React, { useEffect, useRef } from 'react';
import { Message } from './chat-sidebar'; // Import the shared Message interface

interface ChatMessageHistoryProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatMessageHistory: React.FC<ChatMessageHistoryProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      marginBottom: '20px',
      paddingRight: '10px'
    }}>
      {messages.map((message) => (
        <div 
          key={message.id} 
          style={{
            marginBottom: '15px',
            padding: '12px 16px',
            borderRadius: '12px',
            maxWidth: '85%',
            animation: 'slideIn 0.3s ease',
            ...(message.sender === 'user' ? {
              background: 'rgba(100, 116, 139, 0.3)',
              border: '1px solid rgba(100, 116, 139, 0.4)',
              marginLeft: 'auto',
              color: '#f1f5f9'
            } : {
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              color: '#e2e8f0'
            })
          }}
        >
          <div>{message.text}</div>
          {message.timestamp && (
            <div style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              marginTop: '5px'
            }}>
              {message.timestamp}
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div style={{
          display: 'block',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '12px',
          maxWidth: '85%',
          marginBottom: '15px'
        }}>
          <div className="typing-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageHistory; 