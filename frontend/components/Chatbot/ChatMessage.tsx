'use client';

import Image from 'next/image';
import { FaUser } from 'react-icons/fa';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export default function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
        {isUser ? (
          <div className="w-full h-full bg-brand-600 text-white flex items-center justify-center">
            <FaUser size={14} />
          </div>
        ) : (
          <Image
            src="/uploads/chatbotimage.png"
            alt="Workspa Assistant"
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized
          />
        )}
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

