'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { spaAPI, Spa, locationAPI } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { showToast, showErrorToast } from '@/lib/toast';

export default function ViewSpaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const spaId = params?.id ? parseInt(params.id as string) : null;

  const [spa, setSpa] = useState<Spa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationNames, setLocationNames] = useState<{
    country?: string;
    state?: string;
    city?: string;
    area?: string;
  }>({});

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else if (spaId) {
      fetchSpa();
    }
  }, [user, router, spaId]);

  useEffect(() => {
    if (spa) {
      fetchLocationNames();
    }
  }, [spa]);

  const fetchSpa = async () => {
    if (!spaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await spaAPI.getSpaById(spaId);
      setSpa(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch SPA');
      console.error('Failed to fetch SPA:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationNames = async () => {
    if (!spa) return;
    try {
      const [countries, states, cities, areas] = await Promise.all([
        locationAPI.getCountries(),
        spa.country_id ? locationAPI.getStates(spa.country_id) : Promise.resolve([]),
        spa.state_id ? locationAPI.getCities(spa.state_id) : Promise.resolve([]),
        spa.city_id ? locationAPI.getAreas(spa.city_id) : Promise.resolve([]),
      ]);

      const country = countries.find((c: { id: number; name: string }) => c.id === spa.country_id);
      const state = states.find((s: { id: number; name: string }) => s.id === spa.state_id);
      const city = cities.find((c: { id: number; name: string }) => c.id === spa.city_id);
      const area = areas.find((a: { id: number; name: string }) => a.id === spa.area_id);

      setLocationNames({
        country: country?.name,
        state: state?.name,
        city: city?.name,
        area: area?.name,
      });
    } catch (err) {
      console.error('Failed to fetch location names:', err);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !spa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error || 'SPA not found'}</p>
            <Link href="/dashboard/spas" className="btn-primary inline-block">
              Back to SPAs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Hero Section with Logo */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {spa.logo_image ? (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl bg-white">
                  <img
                    src={`${API_URL}/${spa.logo_image}`}
                    alt={spa.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 border-4 border-white/20 shadow-xl flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {spa.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Title and Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{spa.name}</h1>
                {spa.is_verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  spa.is_active ? 'bg-green-500/20 border border-green-300/30' : 'bg-red-500/20 border border-red-300/30'
                }`}>
                  {spa.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {locationNames.city && locationNames.state && (
                <div className="flex items-center text-blue-100">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{[locationNames.area, locationNames.city, locationNames.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {spa.rating !== undefined && spa.rating > 0 && (
                <div className="flex items-center mt-2 text-yellow-200">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(spa.rating || 0) ? 'text-yellow-300' : 'text-gray-400'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 font-medium">{spa.rating?.toFixed(1)} ({spa.reviews || 0} reviews)</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/spas/${spa.id}/edit`}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit SPA
              </Link>
              <Link
                href="/dashboard/spas"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Name</label>
                  <p className="text-gray-900 text-lg font-medium">{spa.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Slug</label>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md font-mono text-sm border border-gray-200">
                      {spa.slug}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/spas/${spa.slug}`);
                        showToast.success('Slug copied to clipboard!');
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Copy slug"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {spa.description && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Description</label>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{spa.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-green-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                    <a href={`mailto:${spa.email}`} className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-all">
                      {spa.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
                    <a href={`tel:${spa.phone}`} className="text-gray-900 hover:text-blue-600 font-medium">
                      {spa.phone}
                    </a>
                  </div>
                </div>
                {spa.website && (
                  <div className="md:col-span-2 flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Website</label>
                      <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-all inline-flex items-center gap-1">
                        {spa.website}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-red-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">Location</h2>
              </div>
              <div className="space-y-5">
                {spa.address && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Address</label>
                      <p className="text-gray-900 font-medium">{spa.address}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {locationNames.country && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Country</label>
                      <p className="text-gray-900 font-medium">{locationNames.country}</p>
                    </div>
                  )}
                  {locationNames.state && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">State</label>
                      <p className="text-gray-900 font-medium">{locationNames.state}</p>
                    </div>
                  )}
                  {locationNames.city && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">City</label>
                      <p className="text-gray-900 font-medium">{locationNames.city}</p>
                    </div>
                  )}
                  {locationNames.area && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Area</label>
                      <p className="text-gray-900 font-medium">{locationNames.area}</p>
                    </div>
                  )}
                </div>
                {/* Get Directions Button */}
                {(spa.latitude && spa.longitude) || spa.address ? (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={
                        spa.latitude && spa.longitude
                          ? `https://www.google.com/maps/dir/?api=1&destination=${spa.latitude},${spa.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spa.address || '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span>Get Directions on Google Maps</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : null}
                
                {(spa.latitude && spa.longitude) && (
                  <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Coordinates</label>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md font-mono text-sm border border-gray-200">
                          {spa.latitude}, {spa.longitude}
                        </code>
                        <a
                          href={`https://www.google.com/maps?q=${spa.latitude},${spa.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View on Google Maps"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(spa.directions || spa.opening_hours || spa.closing_hours || spa.booking_url_website) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                </div>
                <div className="space-y-5">
                  {(spa.opening_hours || spa.closing_hours) && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Operating Hours</label>
                        <div className="space-y-1">
                          {spa.opening_hours && (
                            <p className="text-gray-900 font-medium">Opening: {spa.opening_hours}</p>
                          )}
                          {spa.closing_hours && (
                            <p className="text-gray-900 font-medium">Closing: {spa.closing_hours}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {spa.directions && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Directions</label>
                          {(spa.latitude && spa.longitude) || spa.address ? (
                            <a
                              href={
                                spa.latitude && spa.longitude
                                  ? `https://www.google.com/maps/dir/?api=1&destination=${spa.latitude},${spa.longitude}`
                                  : spa.directions && spa.directions.startsWith('http')
                                  ? spa.directions
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spa.address || '')}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              Open in Maps
                            </a>
                          ) : null}
                        </div>
                        {spa.directions.startsWith('http') ? (
                          <a
                            href={spa.directions}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-all inline-flex items-center gap-1"
                          >
                            {spa.directions}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{spa.directions}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {spa.booking_url_website && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Booking URL</label>
                        <a href={spa.booking_url_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-all inline-flex items-center gap-1">
                          {spa.booking_url_website}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></span>
                Status & Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${spa.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      spa.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {spa.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${spa.is_verified ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">Verification</span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      spa.is_verified
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {spa.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                {spa.rating !== undefined && spa.rating > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-gray-700">Rating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-500 font-semibold">{spa.rating?.toFixed(1)}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">({spa.reviews || 0})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images Gallery */}
            {spa.spa_images && spa.spa_images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></span>
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {spa.spa_images.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:border-blue-300 transition-all">
                      <img
                        src={`${API_URL}/${image}`}
                        alt={`${spa.name} ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  ))}
                </div>
                {spa.logo_image && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Logo Image:</p>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={`${API_URL}/${spa.logo_image}`}
                        alt={`${spa.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></span>
                Metadata
              </h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(spa.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(spa.updated_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

