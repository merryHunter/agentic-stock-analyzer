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
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form className="p-4 bg-white" onSubmit={handleSubmit}>
      <div className="flex items-center">
        <input
          type="text"
          placeholder={isLoading ? "Waiting for response..." : "Ask something..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white p-2 rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 