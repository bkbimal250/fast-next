'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaCrosshairs } from 'react-icons/fa';
import { getUserLocation, LocationData, locationAPI, City, Area } from '@/lib/location';
import { jobAPI } from '@/lib/job';

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

interface LocationSuggestion {
  id: number;
  name: string;
  type: 'area' | 'city' | 'state';
  fullName: string;
}

export default function HeaderSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceOption>(experienceOptions[0]);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const searchBarRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

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

  // Auto-detect location when expanded
  useEffect(() => {
    if (isExpanded && !location && !isDetectingLocation && !detectedLocation) {
      handleAutoDetectLocation();
    }
  }, [isExpanded]);

  // Fetch job suggestions
  useEffect(() => {
    if (isExpanded && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchJobSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setJobSuggestions([]);
      setShowJobSuggestions(false);
    }
  }, [searchQuery, isExpanded]);

  // Fetch location suggestions
  useEffect(() => {
    if (isExpanded && location.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchLocationSuggestions(location);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  }, [location, isExpanded]);

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
            fullName: `${city.name}${city.state?.name ? `, ${city.state.name}` : ''}`,
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
            fullName: `${area.name}${area.city?.name ? `, ${area.city.name}` : ''}`,
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
    setShowJobSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const handleFocus = () => {
    setIsExpanded(true);
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
            {/* Job Title/Keywords Input with Autocomplete */}
            <div className="flex-1 flex items-center border-r border-gray-200 px-4 py-3 sm:py-3.5 relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Job title, keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  handleFocus();
                  if (jobSuggestions.length > 0) setShowJobSuggestions(true);
                }}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                autoFocus
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
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <FaSearch className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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

            {/* Location Input with Auto-detect and Autocomplete */}
            <div className="flex-1 flex items-center border-r border-gray-200 px-4 py-3 sm:py-3.5 relative">
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => {
                  handleFocus();
                  if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
                }}
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
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <span className="text-gray-700 font-medium">{suggestion.name}</span>
                          {suggestion.fullName !== suggestion.name && (
                            <span className="text-gray-500 text-xs ml-1">({suggestion.fullName})</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
