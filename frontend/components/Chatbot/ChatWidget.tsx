 'use client';

import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaSpinner } from 'react-icons/fa';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import JobSuggestionCard from './JobSuggestionCard';
import { chatbotAPI, ChatbotJob } from '@/lib/chatbot';
import { useLocation } from '@/hooks/useLocation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  text: string;
  isUser: boolean;
  jobs?: ChatbotJob[];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your SPA job search assistant. How can I help you find your dream job?",
      isUser: false,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { location } = useLocation(false); // Don't auto-fetch location

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const trackChatbotOpen = async () => {
    if (hasTrackedOpen) return;
    setHasTrackedOpen(true);
    try {
      await fetch(`${API_URL}/api/analytics/track?event_type=chat_opened`, {
        method: 'POST',
      });
    } catch {
      // Silent fail - analytics should never block UI
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    void trackChatbotOpen();
  };

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: Message = { text: message, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Call chatbot API
      const response = await chatbotAPI.search({
        message,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      // Add bot response
      const botMessage: Message = {
        text: response.message,
        isUser: false,
        jobs: response.jobs,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        text: error?.response?.data?.detail || 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center z-50 hover:scale-110"
          aria-label="Open chat"
        >
          <FaComments size={24} />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-brand-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FaComments size={16} />
              </div>
              <div>
                <h3 className="font-semibold">SPA Job Assistant</h3>
                <p className="text-xs text-white/80">Ask me about jobs</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80 transition-colors"
              aria-label="Close chat"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index}>
                <ChatMessage message={msg.text} isUser={msg.isUser} />
                {msg.jobs && msg.jobs.length > 0 && (
                  <div className="ml-11 mb-4">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">
                      Job Suggestions:
                    </p>
                    {msg.jobs.map((job) => (
                      <JobSuggestionCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FaSpinner className="animate-spin" size={14} />
                <span>Searching jobs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      )}
    </>
  );
}


