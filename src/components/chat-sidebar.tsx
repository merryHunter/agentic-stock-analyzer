// src/components/chat-sidebar.tsx
"use client";
import React from 'react';
import ChatInput from './chat-input';
import ChatMessageHistory from './chat-message-history';

const ChatSidebar = () => {
  return (
    <aside className="w-1/4 bg-gray-100 flex flex-col h-screen">
      <h2 className="text-xl font-bold p-4 bg-white border-b">Chat</h2>
      <ChatMessageHistory />
      <ChatInput />
    </aside>
  );
};

export default ChatSidebar; 