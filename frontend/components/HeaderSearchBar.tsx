'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaCrosshairs } from 'react-icons/fa';
import { getUserLocation, LocationData } from '@/lib/location';

interface ExperienceOption {
  label: string;
  min?: number;
  max?: number;
}

const experienceOptions: ExperienceOption[] = [
  { label: 'Select experience', min: undefined, max: undefined },
  { label: '0-1 years', min: 0, max: 1 },
  { label: '1-3 years', min: 1, max: 3 },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '5-10 years', min: 5, max: 10 },
  { label: '10+ years', min: 10, max: undefined },
];

export default function HeaderSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceOption>(experienceOptions[0]);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const router = useRouter();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsExperienceOpen(false);
        // Don't collapse if form has focus
        if (!formRef.current?.contains(event.target as Node)) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location when expanded
  useEffect(() => {
    if (isExpanded && !location && !isDetectingLocation && !detectedLocation) {
      handleAutoDetectLocation();
    }
  }, [isExpanded]);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const locationData: LocationData = await getUserLocation();
      if (locationData.city) {
        const locationStr = [locationData.city, locationData.state]
          .filter(Boolean)
          .join(', ');
        setLocation(locationStr);
        setDetectedLocation(locationStr);
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    
    if (location.trim()) {
      params.append('location', location.trim());
    }
    
    if (selectedExperience.min !== undefined || selectedExperience.max !== undefined) {
      if (selectedExperience.min !== undefined) {
        params.append('experience_years_min', selectedExperience.min.toString());
      }
      if (selectedExperience.max !== undefined) {
        params.append('experience_years_max', selectedExperience.max.toString());
      }
    }
    
    router.push(`/jobs?${params.toString()}`);
    setIsExpanded(false);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div ref={searchBarRef} className="relative w-full z-50">
      <form ref={formRef} onSubmit={handleSearch} className="w-full">
        {!isExpanded ? (
          // Collapsed state - compact search bar in navbar
          <div 
            className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200/50 cursor-text hover:shadow-md hover:border-gray-300 transition-all h-9"
            onClick={handleFocus}
          >
            <FaSearch className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery || location ? `${searchQuery}${searchQuery && location ? ', ' : ''}${location}` : ''}
              readOnly
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-xs sm:text-sm cursor-text bg-transparent"
              onFocus={handleFocus}
            />
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 transition-colors flex-shrink-0 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                handleFocus();
              }}
            >
              <FaSearch className="w-3 h-3" />
            </button>
          </div>
        ) : (
          // Expanded state - full search bar
          <div className="flex flex-col sm:flex-row gap-0 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Job Title/Keywords Input */}
            <div className="flex-1 flex items-center border-r border-gray-200 px-4 py-3 sm:py-3.5">
              <input
                type="text"
                placeholder="Job title, keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                autoFocus
              />
            </div>

            {/* Experience Dropdown */}
            <div className="relative flex-shrink-0 border-r border-gray-200">
              <button
                type="button"
                onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                onFocus={handleFocus}
                className="flex items-center justify-between px-4 py-3 sm:py-3.5 w-full sm:w-48 text-left hover:bg-gray-50 transition-colors"
              >
                <span className={`text-sm sm:text-base ${selectedExperience.label === 'Select experience' ? 'text-gray-400' : 'text-gray-700'}`}>
                  {selectedExperience.label}
                </span>
                <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExperienceOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExperienceOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsExperienceOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {experienceOptions.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedExperience(option);
                          setIsExperienceOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                          selectedExperience.label === option.label
                            ? 'bg-brand-50 text-brand-700 font-medium'
                            : 'text-gray-700'
                        } ${index === 0 ? 'rounded-t-lg' : ''} ${index === experienceOptions.length - 1 ? 'rounded-b-lg' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Location Input with Auto-detect */}
            <div className="flex-1 flex items-center border-r border-gray-200 px-4 py-3 sm:py-3.5 relative">
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={handleFocus}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base pr-8"
              />
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isDetectingLocation}
                className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                title="Auto-detect location"
              >
                {isDetectingLocation ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCrosshairs className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
