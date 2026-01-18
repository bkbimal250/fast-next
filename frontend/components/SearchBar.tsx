'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaCrosshairs } from 'react-icons/fa';
import { locationAPI, City, Area } from '@/lib/location';
import { jobAPI } from '@/lib/job';
import { getUserLocation, LocationData } from '@/lib/location';

interface LocationSuggestion {
  id: number;
  name: string;
  type: 'area' | 'city';
  fullName: string;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  
  // Autocomplete states
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [jobSuggestionsLoading, setJobSuggestionsLoading] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);
  
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-detect location on mount
  useEffect(() => {
    if (!location && !isDetectingLocation && !detectedLocation) {
      handleAutoDetectLocation();
    }
  }, []);

  // Fetch job suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchJobSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setJobSuggestions([]);
      setShowJobSuggestions(false);
    }
  }, [searchQuery]);

  // Fetch location suggestions
  useEffect(() => {
    if (location.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchLocationSuggestions(location);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [location]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowJobSuggestions(false);
      }
      if (locationSuggestionsRef.current && !locationSuggestionsRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJobSuggestions = async (query: string) => {
    setJobSuggestionsLoading(true);
    try {
      const jobs = await jobAPI.getAllJobs({ limit: 50 });
      const uniqueTitles = Array.from(
        new Set(
          jobs
            .map(job => job.title)
            .filter(title => title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
        )
      );
      setJobSuggestions(uniqueTitles);
      setShowJobSuggestions(uniqueTitles.length > 0);
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
      setJobSuggestions([]);
      setShowJobSuggestions(false);
    } finally {
      setJobSuggestionsLoading(false);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    setLocationSuggestionsLoading(true);
    try {
      const [cities, areas] = await Promise.all([
        locationAPI.getCities(undefined, undefined, 0, 100),
        locationAPI.getAreas(undefined, 0, 100),
      ]);

      const suggestions: LocationSuggestion[] = [];

      // Add matching cities
      cities
        .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .forEach(city => {
          suggestions.push({
            id: city.id,
            name: city.name,
            type: 'city',
            fullName: city.name, // Just city name, no state
          });
        });

      // Add matching areas
      areas
        .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .forEach(area => {
          suggestions.push({
            id: area.id,
            name: area.name,
            type: 'area',
            fullName: area.city?.name ? `${area.name} ${area.city.name}` : area.name, // Format: "area city" (no comma, no state)
          });
        });

      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } finally {
      setLocationSuggestionsLoading(false);
    }
  };

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const locationData: LocationData = await getUserLocation();
      if (locationData.city) {
        // Only use city, no state
        setLocation(locationData.city);
        setDetectedLocation(locationData.city);
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
    
    
    router.push(`/jobs?${params.toString()}`);
    setShowJobSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const handleJobSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowJobSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleLocationSuggestionClick = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.fullName);
    setShowLocationSuggestions(false);
    locationInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white rounded-lg sm:rounded-xl shadow-xl p-2 sm:p-1.5">
        {/* Job Title/Keywords Input with Autocomplete */}
        <div className="flex-1 flex items-center border sm:border-r sm:border-0 border-gray-200 rounded-lg sm:rounded-none sm:rounded-l-lg pr-2 sm:pr-3 md:pr-4 pl-3 sm:pl-4 md:pl-5 py-2.5 sm:py-3 md:py-4 relative min-w-0">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="spa Therapist, spa manager, receptionist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (jobSuggestions.length > 0) setShowJobSuggestions(true);
            }}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base min-w-0"
          />
          
          {/* Job Suggestions Dropdown */}
          {showJobSuggestions && jobSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
            >
              {jobSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleJobSuggestionClick(suggestion)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaSearch className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Input with Autocomplete and Auto-detect */}
        <div className="flex-1 flex items-center border sm:border-r sm:border-0 border-gray-200 rounded-lg sm:rounded-none pr-2 sm:pr-3 md:pr-4 pl-3 sm:pl-4 md:pl-5 py-2.5 sm:py-3 md:py-4 relative min-w-0">
          <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
          <input
            ref={locationInputRef}
            type="text"
            placeholder="City, area..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => {
              if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
            }}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base pr-7 sm:pr-8 min-w-0"
          />
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={isDetectingLocation}
            className="absolute right-1.5 sm:right-2 p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 flex-shrink-0"
            title="Auto-detect location"
            aria-label="Auto-detect location"
          >
            {isDetectingLocation ? (
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaCrosshairs className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Location Suggestions Dropdown */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div
              ref={locationSuggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
            >
              {locationSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => handleLocationSuggestionClick(suggestion)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">{suggestion.fullName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-white font-semibold px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-r-lg transition-all duration-200 whitespace-nowrap text-sm sm:text-base shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <FaSearch className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Search Jobs</span>
          <span className="sm:hidden">Search</span>
        </button>
      </div>
    </form>
  );
}
