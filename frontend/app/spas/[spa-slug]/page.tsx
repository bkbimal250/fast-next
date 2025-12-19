'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { spaAPI, Spa } from '@/lib/spa';
import { jobAPI, Job } from '@/lib/job';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import Link from 'next/link';

export default function SpaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.['spa-slug'] as string;

  const [spa, setSpa] = useState<Spa | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [locationNames, setLocationNames] = useState<{
    country?: string;
    state?: string;
    city?: string;
    area?: string;
  }>({});

  useEffect(() => {
    if (slug) {
      fetchSpa();
    }
  }, [slug]);

  useEffect(() => {
    if (spa) {
      fetchJobs();
      fetchLocationNames();
    }
  }, [spa]);

  const fetchSpa = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await spaAPI.getSpaBySlug(slug);
      setSpa(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch SPA');
      console.error('Failed to fetch SPA:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    if (!spa) return;
    try {
      const data = await jobAPI.getAllJobs({ spa_id: spa.id });
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const fetchLocationNames = async () => {
    if (!spa) return;
    try {
      const { locationAPI } = await import('@/lib/location');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !spa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">SPA Not Found</h1>
          <p className="text-gray-600 mb-6">The SPA you're looking for doesn't exist or has been removed.</p>
          <Link href="/spa-near-me" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse All SPAs
          </Link>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const allImages = spa.banner_image 
    ? [spa.banner_image, ...(spa.spa_images || [])]
    : (spa.spa_images || []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Banner Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
        {allImages.length > 0 ? (
          <div className="relative w-full h-full">
            <img
              src={`${API_URL}/${allImages[activeImageIndex]}`}
              alt={spa.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 flex items-center justify-center">
            <div className="text-white text-8xl font-bold opacity-50">
              {spa.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Image Navigation */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  activeImageIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/spa-near-me"
            className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </div>

      {/* Header Info Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo/Image */}
            <div className="flex-shrink-0">
              {allImages.length > 0 ? (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl -mt-16">
                  <img
                    src={`${API_URL}/${allImages[0]}`}
                    alt={spa.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl -mt-16 border-4 border-white">
                  {spa.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{spa.name}</h1>
                {spa.is_verified && (
                  <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              {/* Location & Contact Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {locationNames.city && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">
                      {[locationNames.area, locationNames.city, locationNames.state]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {spa.phone && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${spa.phone}`} className="hover:text-blue-600 font-medium">
                      {spa.phone}
                    </a>
                  </div>
                )}
                {spa.email && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${spa.email}`} className="hover:text-blue-600 font-medium">
                      {spa.email}
                    </a>
                  </div>
                )}
                {(spa.opening_hours || spa.closing_hours) && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">
                      {spa.opening_hours} - {spa.closing_hours}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {spa.website && (
                  <a
                    href={spa.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}
                {spa.booking_url_website && (
                  <a
                    href={spa.booking_url_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </a>
                )}
                {spa.directions && (
                  <a
                    href={spa.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {spa.description && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                  About Us
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {spa.description}
                </div>
              </div>
            )}

            {/* Gallery */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                      onClick={() => setActiveImageIndex(index + 1)}
                    >
                      <img
                        src={`${API_URL}/${image}`}
                        alt={`${spa.name} ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs Section */}
            {jobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                  Available Positions ({jobs.length})
                </h2>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      spaName={spa.name}
                      spaAddress={spa.address}
                      location={`${locationNames.area || ''} ${locationNames.city || ''}`.trim() || 'Location'}
                      salaryMin={job.salary_min}
                      salaryMax={job.salary_max}
                      salaryCurrency={job.salary_currency}
                      experienceMin={job.experience_years_min}
                      experienceMax={job.experience_years_max}
                      jobOpeningCount={job.job_opening_count}
                      jobType={job.job_type?.name}
                      jobCategory={job.job_category?.name}
                      slug={job.slug}
                      isFeatured={job.is_featured}
                      viewCount={job.view_count}
                      created_at={job.created_at}
                      description={job.description}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Contact Information
              </h3>
              <div className="space-y-4 text-sm">
                {spa.address && (
                  <div>
                    <p className="text-gray-500 mb-1 font-medium">Address</p>
                    <p className="text-gray-900 leading-relaxed">{spa.address}</p>
                  </div>
                )}
                {spa.phone && (
                  <div>
                    <p className="text-gray-500 mb-1 font-medium">Phone</p>
                    <a href={`tel:${spa.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {spa.phone}
                    </a>
                  </div>
                )}
                {spa.email && (
                  <div>
                    <p className="text-gray-500 mb-1 font-medium">Email</p>
                    <a href={`mailto:${spa.email}`} className="text-blue-600 hover:text-blue-700 font-medium break-all">
                      {spa.email}
                    </a>
                  </div>
                )}
                {spa.website && (
                  <div>
                    <p className="text-gray-500 mb-1 font-medium">Website</p>
                    <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium break-all">
                      {spa.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            {(spa.opening_hours || spa.closing_hours) && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Operating Hours
                </h3>
                <div className="flex items-center gap-3 text-gray-700">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-lg">
                      {spa.opening_hours} - {spa.closing_hours}
                    </p>
                    <p className="text-sm text-gray-500">Daily</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Map */}
            {spa.latitude && spa.longitude && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Location
                </h3>
                <a
                  href={`https://www.google.com/maps?q=${spa.latitude},${spa.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
