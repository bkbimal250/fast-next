'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaCrosshairs } from 'react-icons/fa';
import { locationAPI, City, Area } from '@/lib/location';
import { jobAPI } from '@/lib/job';
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

interface LocationSuggestion {
  id: number;
  name: string;
  type: 'area' | 'city' | 'state';
  fullName: string;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceOption>(experienceOptions[0]);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
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
      if (!searchInputRef.current?.contains(event.target as Node) && !locationInputRef.current?.contains(event.target as Node)) {
        setIsExperienceOpen(false);
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
      <div className="flex flex-col md:flex-row gap-2 md:gap-0 bg-white rounded-lg shadow-xl p-2 md:p-1.5">
        {/* Job Title/Keywords Input with Autocomplete */}
        <div className="flex-1 flex items-center border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none md:rounded-l-lg pr-3 md:pr-4 pl-4 md:pl-5 py-3 md:py-4 relative">
          <FaSearch className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (jobSuggestions.length > 0) setShowJobSuggestions(true);
            }}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base md:text-lg"
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
        <div className="relative flex-shrink-0 border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none">
          <button
            type="button"
            onClick={() => setIsExperienceOpen(!isExperienceOpen)}
            className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 w-full md:w-48 text-left hover:bg-gray-50 transition-colors"
          >
            <span className={`text-sm sm:text-base md:text-lg ${selectedExperience.label === 'Select experience' ? 'text-gray-400' : 'text-gray-700'}`}>
              {selectedExperience.label}
            </span>
            <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExperienceOpen ? 'rotate-180' : ''}`} />
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

        {/* Location Input with Autocomplete and Auto-detect */}
        <div className="flex-1 flex items-center border md:border-r md:border-0 border-gray-200 rounded-lg md:rounded-none pr-3 md:pr-4 pl-4 md:pl-5 py-3 md:py-4 relative">
          <FaMapMarkerAlt className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={locationInputRef}
            type="text"
            placeholder="City, area, or zip"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => {
              if (locationSuggestions.length > 0) setShowLocationSuggestions(true);
            }}
            className="flex-1 outline-none text-gray-700 placeholder-gray-500 text-sm sm:text-base md:text-lg pr-8"
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
