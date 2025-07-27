"use client";
import React from 'react';

// This will be expanded later to include message content, sender, etc.
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatMessageHistory = () => {
  // Placeholder for message state
  const messages: Message[] = [
    { id: 1, text: "Welcome! How can I help you analyze stocks today?", sender: 'bot' }
  ];

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