import React from 'react';

interface QuickReplyButtonsProps {
  replies: string[];
  onReplyClick: (reply: string) => void;
}

const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({ replies, onReplyClick }) => {
  return (
    <div className="flex flex-wrap gap-2 my-3 animate-slide-up">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReplyClick(reply)}
          className="bg-white border border-blue-300 text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 transition-colors shadow-sm"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;