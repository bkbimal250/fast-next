'use client';

import { FaUser, FaRobot } from 'react-icons/fa';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export default function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isUser ? <FaUser size={14} /> : <FaRobot size={14} />}
      </div>
      <div
        className={`flex-1 rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

