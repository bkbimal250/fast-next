'use client';

import { useState, useEffect } from 'react';
import { spaAPI, Spa } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import SpaCard from '@/components/SpaCard';
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
    } else if (spas.length > 0 && sortBy === 'distance') {
      const sorted = [...spas].sort((a, b) => {
        const distA = distances[a.id] || Infinity;
        const distB = distances[b.id] || Infinity;
        return distA - distB;
      });
      setSpas(sorted);
    }
  }, [sortBy]);

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
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              SPAs Near Me
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Search Radius:</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>

              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap ml-4">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="distance">Distance</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh Location'}</span>
              </button>

              {locationError && (
                <button
                  onClick={getCurrentLocation}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Enable Location</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !spas.length ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Finding spas near you...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700">{String(error)}</p>
              </div>
            </div>
          </div>
        ) : spas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No SPAs Found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              {userLocation
                ? `No spas found within ${radius}km of your location. Try increasing the search radius.`
                : 'Please enable location access to find nearby spas.'}
            </p>
            {!userLocation && (
              <button onClick={getCurrentLocation} className="btn-primary text-lg px-8 py-3">
                Enable Location
              </button>
            )}
            {userLocation && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setRadius(20)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Try 20 km
                </button>
                <button
                  onClick={() => setRadius(50)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Try 50 km
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {spas.length} {spas.length === 1 ? 'SPA' : 'SPAs'} within {radius}km
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {userLocation && `Showing results near your location`}
                  </p>
                </div>
                {userLocation && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Location active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Spa Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spas.map((spa) => (
                <SpaCard key={spa.id} spa={spa} distance={distances[spa.id]} showDistance={true} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
