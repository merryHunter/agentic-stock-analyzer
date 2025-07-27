// src/components/chat-sidebar.tsx
"use client";
import React, { useState } from 'react';
import ChatInput from './chat-input';
import ChatMessageHistory from './chat-message-history';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
}

const ChatSidebar = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your AI trading assistant. I can help you analyze stocks, interpret market trends, and answer trading questions. How can I assist you today?", 
      sender: 'bot',
      timestamp: 'Just now'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message to the UI immediately
    const userMessage: Message = { 
      id: Date.now(), 
      text, 
      sender: 'user',
      timestamp: 'Just now'
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const conversationHistory = [...messages, userMessage].map(msg => ({
      role: msg.sender,
      content: msg.text
    }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.body) {
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';
      const botMessageId = Date.now() + 1;

      // Add a placeholder for the bot's message
      setMessages(prev => [...prev, { 
        id: botMessageId, 
        text: '...', 
        sender: 'bot',
        timestamp: 'Just now'
      }]);

      while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Server-Sent Events format is "data: content\n\n"
          const lines = chunk.split('\n\n');
          for (const line of lines) {
              if (line.startsWith('data: ')) {
                  botMessage += line.substring(6);
                  setMessages(prev => prev.map(msg => 
                      msg.id === botMessageId ? { ...msg, text: botMessage } : msg
                  ));
              }
          }
      }
    } catch (error) {
      // Fallback response for demo
      const fallbackResponses = [
        "Based on current market conditions, I'd recommend monitoring key support and resistance levels.",
        "The technical indicators suggest a bullish trend, but keep an eye on volume patterns.",
        "Market sentiment appears positive today. Consider the broader economic context in your analysis.",
        "That's an interesting question. The fundamentals look strong, but always consider risk management.",
        "I'd suggest looking at the sector performance and comparing it to the overall market trends."
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'bot',
        timestamp: 'Just now'
      }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="panel chat-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div className="panel-header">
        <svg className="icon" viewBox="0 0 20 20">
          <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/>
        </svg>
        <h2>Trading Assistant</h2>
      </div>
      
      <ChatMessageHistory messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatSidebar; 