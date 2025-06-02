import React from 'react';
import { AlertCircle, Check, Clock } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';
  
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isAI
            ? 'bg-white text-gray-800 shadow-sm'
            : 'bg-blue-500 text-white'
        }`}
      >
        {message.content}
        
        {message.status && (
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-70">
              {message.status === 'sent' && <Check size={12} />}
              {message.status === 'delivered' && <Check size={12} />}
              {message.status === 'pending' && <Clock size={12} />}
              {message.status === 'error' && <AlertCircle size={12} />}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;