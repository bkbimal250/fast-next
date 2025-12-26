'use client';

import { useState, useEffect } from 'react';
import { spaAPI, Spa } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import SpaCard from '@/components/SpaCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

interface Location {
  latitude: number;
  longitude: number;
}

export default function SpaNearMePage() {
  const [spas, setSpas] = useState<Spa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(10); // Default 10km radius
  const [distances, setDistances] = useState<Record<number, number>>({});
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [currentPage, setCurrentPage] = useState(1);
  const spasPerPage = 12;

  useEffect(() => {
    // Only get location on client side
    if (typeof window !== 'undefined') {
      getCurrentLocation();
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySpas();
    }
  }, [userLocation, radius]);

  useEffect(() => {
    if (spas.length > 0 && sortBy === 'name') {
      const sorted = [...spas].sort((a, b) => a.name.localeCompare(b.name));
      setSpas(sorted);
      setCurrentPage(1); // Reset to first page when sorting changes
    } else if (spas.length > 0 && sortBy === 'distance') {
      const sorted = [...spas].sort((a, b) => {
        const distA = distances[a.id] || Infinity;
        const distB = distances[b.id] || Infinity;
        return distA - distB;
      });
      setSpas(sorted);
      setCurrentPage(1); // Reset to first page when sorting changes
    }
  }, [sortBy]);

  // Calculate paginated spas
  const paginatedSpas = spas.slice(
    (currentPage - 1) * spasPerPage,
    currentPage * spasPerPage
  );

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
        setLocationError(null);
      },
      (err) => {
        let errorMessage = 'Unable to get your location.';
        if (err.code === 1) {
          errorMessage = 'Location access denied. Please enable location permissions.';
        } else if (err.code === 2) {
          errorMessage = 'Location unavailable. Please check your device settings.';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  const fetchNearbySpas = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const nearbySpas = await spaAPI.getSpasNearMe(
        userLocation.latitude,
        userLocation.longitude,
        radius
      );

      // Calculate distances for each SPA
      const distanceMap: Record<number, number> = {};
      nearbySpas.forEach((spa) => {
        if (spa.latitude && spa.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            spa.latitude,
            spa.longitude
          );
          distanceMap[spa.id] = distance;
        }
      });

      // Sort by distance
      nearbySpas.sort((a, b) => {
        const distA = distanceMap[a.id] || Infinity;
        const distB = distanceMap[b.id] || Infinity;
        return distA - distB;
      });

      setSpas(nearbySpas);
      setDistances(distanceMap);
    } catch (err: any) {
      let errorMessage = 'Failed to fetch nearby SPAs';
      
      if (err.response?.data) {
        if (err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage = err.response.data.detail.map((e: any) => e.msg).join(', ');
          } else if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
          } else {
            errorMessage = 'Invalid request parameters';
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Failed to fetch nearby SPAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-2">
              SPAs Near Me
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Discover the best spas and wellness centers in your area
            </p>
            
            {/* Location Status */}
            {userLocation && (
              <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Location detected</span>
              </div>
            )}

            {locationError && (
              <div className="inline-flex items-center space-x-3 bg-red-500/20 backdrop-blur-md rounded-full px-6 py-3 border border-red-300/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{locationError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-none">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Radius:</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all flex-1 sm:flex-none"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-none">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
                  className="border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all flex-1 sm:flex-none"
                >
                  <option value="distance">Distance</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {locationError && (
                <button
                  onClick={getCurrentLocation}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Enable</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading && !spas.length ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brand-600 mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg">Finding spas near you...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900 text-sm sm:text-base">Error</p>
                <p className="text-red-700 text-xs sm:text-sm">{String(error)}</p>
              </div>
            </div>
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl border-2 border-gray-200 px-4">
            <svg
              className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4 sm:mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {userLocation ? 'No SPAs Found Nearby' : 'Location Access Required'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {userLocation
                ? `No spas found within ${radius}km of your location. ${locationError ? 'Showing popular spas in your city instead.' : 'Try increasing the search radius or browse all spas.'}`
                : 'Please enable location access to find nearby spas, or browse all spas.'}
            </p>
            {!userLocation && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={getCurrentLocation} className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3">
                  Enable Location
                </button>
                <Link
                  href="/spas"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base text-center"
                >
                  Browse All SPAs
                </Link>
              </div>
            )}
            {userLocation && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => setRadius(20)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Try 20 km
                </button>
                <button
                  onClick={() => setRadius(50)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Try 50 km
                </button>
                <Link
                  href="/spas"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base text-center"
                >
                  Browse All SPAs
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-4 sm:mb-6 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Found {spas.length} {spas.length === 1 ? 'SPA' : 'SPAs'} within {radius}km
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {userLocation && `Showing results near your location`}
                  </p>
                </div>
                {userLocation && (
                  <div className="flex sm:hidden md:flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Location active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Spa Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedSpas.map((spa) => (
                <SpaCard key={spa.id} spa={spa} distance={distances[spa.id]} showDistance={true} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={currentPage}
                totalItems={spas.length}
                itemsPerPage={spasPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
