"use client";
import React from 'react';
import { Message } from './chat-sidebar'; // Import the shared Message interface

interface ChatMessageHistoryProps {
  messages: Message[];
}

const ChatMessageHistory: React.FC<ChatMessageHistoryProps> = ({ messages }) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-300'}`}>
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessageHistory; 