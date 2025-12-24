'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ViewJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id ? parseInt(params.id as string) : null;

  const [job, setJob] = useState<Job | null>(null);
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
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    } else if (jobId) {
      fetchJob();
    }
  }, [user, router, jobId]);

  useEffect(() => {
    if (job) {
      fetchSpa();
      fetchLocationNames();
    }
  }, [job]);

  const fetchJob = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await jobAPI.getJobById(jobId);
      setJob(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch job');
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpa = async () => {
    if (!job?.spa_id) return;
    try {
      const data = await spaAPI.getSpaById(job.spa_id);
      setSpa(data);
    } catch (err) {
      console.error('Failed to fetch SPA:', err);
    }
  };

  const fetchLocationNames = async () => {
    if (!job) return;
    try {
      const [countries, states, cities, areas] = await Promise.all([
        locationAPI.getCountries(),
        job.country_id ? locationAPI.getStates(job.country_id) : Promise.resolve([]),
        job.state_id ? locationAPI.getCities(job.state_id) : Promise.resolve([]),
        job.city_id ? locationAPI.getAreas(job.city_id) : Promise.resolve([]),
      ]);

      const country = countries.find((c) => c.id === job.country_id);
      const state = states.find((s) => s.id === job.state_id);
      const city = cities.find((c) => c.id === job.city_id);
      const area = areas.find((a) => a.id === job.area_id);

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

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
            <Link href="/dashboard/jobs" className="btn-primary inline-block">
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-2">Job Details</p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/dashboard/jobs/${job.id}/edit`} className="btn-primary">
              Edit Job
            </Link>
            <Link href="/dashboard/jobs" className="btn-secondary">
              Back to List
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-gray-900">{job.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Slug</label>
                  <p className="text-gray-900 font-mono text-sm">{job.slug}</p>
                </div>
                {job.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Requirements</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Salary & Experience */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary & Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(job.salary_min || job.salary_max) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Salary Range</label>
                    <p className="text-gray-900">
                      {job.salary_min && job.salary_max
                        ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                        : job.salary_min
                        ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()}+`
                        : 'Not specified'}
                    </p>
                  </div>
                )}
                {(job.experience_years_min || job.experience_years_max) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience Required</label>
                    <p className="text-gray-900">
                      {job.experience_years_min && job.experience_years_max
                        ? `${job.experience_years_min} - ${job.experience_years_max} years`
                        : job.experience_years_min
                        ? `${job.experience_years_min}+ years`
                        : 'Not specified'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
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
                {(job.latitude && job.longitude) && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Coordinates</label>
                    <p className="text-gray-900 font-mono text-sm">
                      {job.latitude}, {job.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* HR Contact */}
            {(job.hr_contact_name || job.hr_contact_email || job.hr_contact_phone) && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.hr_contact_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{job.hr_contact_name}</p>
                    </div>
                  )}
                  {job.hr_contact_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{job.hr_contact_email}</p>
                    </div>
                  )}
                  {job.hr_contact_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{job.hr_contact_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SPA Information */}
            {spa && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated SPA</h2>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{spa.name}</p>
                  <p className="text-gray-600 text-sm">{spa.email}</p>
                  <p className="text-gray-600 text-sm">{spa.phone}</p>
                  <Link href={`/dashboard/spas/${spa.id}`} className="text-primary-600 hover:underline text-sm">
                    View SPA Details →
                  </Link>
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
                      job.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.is_featured
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.is_featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="text-gray-900 font-medium">{job.view_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Apply Clicks:</span>
                  <span className="text-gray-900 font-medium">{job.apply_click_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="text-gray-900 font-medium">{job.message_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(job.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {job.expires_at && (
                  <div>
                    <span className="text-gray-600">Expires:</span>{' '}
                    <span className="text-gray-900">
                      {new Date(job.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

