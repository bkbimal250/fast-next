'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { spaAPI, Spa, locationAPI } from '@/lib/spa';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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

      const country = countries.find((c) => c.id === spa.country_id);
      const state = states.find((s) => s.id === spa.state_id);
      const city = cities.find((c) => c.id === spa.city_id);
      const area = areas.find((a) => a.id === spa.area_id);

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner Image */}
      {spa.banner_image && (
        <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
          <img
            src={`${API_URL}/${spa.banner_image}`}
            alt={spa.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{spa.name}</h1>
            <p className="text-gray-600 mt-2">SPA Details</p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/dashboard/spas/${spa.id}/edit`} className="btn-primary">
              Edit SPA
            </Link>
            <Link href="/dashboard/spas" className="btn-secondary">
              Back to List
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{spa.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Slug</label>
                  <p className="text-gray-900 font-mono text-sm">{spa.slug}</p>
                </div>
                {spa.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{spa.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{spa.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{spa.phone}</p>
                </div>
                {spa.website && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-gray-900">
                      <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {spa.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-4">
                {spa.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{spa.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {locationNames.country && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                      <p className="text-gray-900">{locationNames.country}</p>
                    </div>
                  )}
                  {locationNames.state && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                      <p className="text-gray-900">{locationNames.state}</p>
                    </div>
                  )}
                  {locationNames.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="text-gray-900">{locationNames.city}</p>
                    </div>
                  )}
                  {locationNames.area && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Area</label>
                      <p className="text-gray-900">{locationNames.area}</p>
                    </div>
                  )}
                </div>
                {(spa.latitude && spa.longitude) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Coordinates</label>
                    <p className="text-gray-900 font-mono text-sm">
                      {spa.latitude}, {spa.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(spa.directions || spa.opening_hours || spa.closing_hours || spa.booking_url_website) && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="space-y-4">
                  {spa.opening_hours && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Opening Hours</label>
                      <p className="text-gray-900">{spa.opening_hours}</p>
                    </div>
                  )}
                  {spa.closing_hours && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Closing Hours</label>
                      <p className="text-gray-900">{spa.closing_hours}</p>
                    </div>
                  )}
                  {spa.directions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Directions</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{spa.directions}</p>
                    </div>
                  )}
                  {spa.booking_url_website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Booking URL</label>
                      <p className="text-gray-900">
                        <a href={spa.booking_url_website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          {spa.booking_url_website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      spa.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {spa.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      spa.is_verified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {spa.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Images */}
            {spa.spa_images && spa.spa_images.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
                <div className="grid grid-cols-2 gap-2">
                  {spa.spa_images.map((image, index) => (
                    <img
                      key={index}
                      src={`${API_URL}/${image}`}
                      alt={`${spa.name} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(spa.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(spa.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

