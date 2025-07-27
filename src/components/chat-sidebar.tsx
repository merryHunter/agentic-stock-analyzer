// src/components/chat-sidebar.tsx
"use client";
import React, { useState } from 'react';
import ChatInput from './chat-input';
import ChatMessageHistory from './chat-message-history';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatSidebar = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome! Ask me anything about financial markets.", sender: 'bot' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message to the UI immediately
    const userMessage: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const conversationHistory = [...messages, userMessage].map(msg => ({
      role: msg.sender,
      content: msg.text
    }));
    
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
    setMessages(prev => [...prev, { id: botMessageId, text: '...', sender: 'bot' }]);

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
    
    setIsLoading(false);
  };

  return (
    <aside className="w-1/4 bg-gray-100 flex flex-col h-screen">
      <h2 className="text-xl font-bold p-4 bg-white border-b">Chat</h2>
      <ChatMessageHistory messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </aside>
  );
};

export default ChatSidebar; 