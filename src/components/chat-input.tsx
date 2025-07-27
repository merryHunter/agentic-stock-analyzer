"use client";
import React from 'react';

const ChatInput = () => {
  return (
    <form className="p-4 bg-white">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Ask something..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-2 rounded-r-md hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 