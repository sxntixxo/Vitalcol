import React from 'react';

const AITypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg px-4 py-2 w-fit animate-fade-in">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-typing-dot-1"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-typing-dot-2"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-typing-dot-3"></div>
    </div>
  );
};

export default AITypingIndicator;