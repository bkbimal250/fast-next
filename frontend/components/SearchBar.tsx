'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col md:flex-row gap-2 md:gap-0 bg-white rounded-lg shadow-xl p-2 md:p-1.5">
        <div className="flex-1 flex items-center border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none md:rounded-l-lg pr-3 md:pr-4 pl-4 md:pl-5 py-3 md:py-4">
          <FaSearch className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base md:text-lg"
          />
        </div>
        <div className="flex-1 flex items-center border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none pr-3 md:pr-4 pl-4 md:pl-5 py-3 md:py-4">
          <FaMapMarkerAlt className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="City, state, or zip"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base md:text-lg"
          />
        </div>
        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 md:px-10 py-3 md:py-4 rounded-lg transition-all duration-200 whitespace-nowrap text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg w-full md:w-auto"
        >
          Search Jobs
        </button>
      </div>
    </form>
  );
}

