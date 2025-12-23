'use client';

import { FaLightbulb } from 'react-icons/fa';

interface QuerySuggestionsProps {
  suggestions: string[];
  onSelect: (query: string) => void;
}

export default function QuerySuggestions({ suggestions, onSelect }: QuerySuggestionsProps) {
  return (
    <div className="mt-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <FaLightbulb color="#115e59" size={14} />
        <p className="text-xs text-gray-500 font-semibold">Try asking:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors text-gray-700"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

