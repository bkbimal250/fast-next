'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import axios from 'axios';
import Link from 'next/link';
import JobCard from '@/components/JobCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface JobWithRelations extends Job {
  spa?: Spa & {
    rating?: number;
    reviews?: number;
  };
  job_type?: { id: number; name: string; slug: string };
  job_category?: { id: number; name: string; slug: string };
  state?: { id: number; name: string };
  city?: { id: number; name: string };
  area?: { id: number; name: string };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params['job-slug']) {
      fetchJob();
    }
  }, [params]);

  useEffect(() => {
    if (job) {
      trackView();
      fetchRelatedJobs();
      fetchApplicationCount();
    }
  }, [job]);

  const fetchJob = async () => {
    try {
      const data = await jobAPI.getJobBySlug(params['job-slug'] as string);
      setJob(data as JobWithRelations);
      
      // Fetch SPA details if not included in response
      if (data.spa_id && (!data.spa || !data.spa.rating)) {
        try {
          const spaData = await spaAPI.getSpaById(data.spa_id);
          setJob(prev => prev ? { ...prev, spa: { ...prev.spa, ...spaData } } : null);
        } catch (err) {
          console.error('Error fetching SPA details:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedJobs = async () => {
    try {
      if (!job) return;
      
      // Get related jobs based on job category or location
      const queryParams: any = {
        limit: 5,
        is_active: true,
      };
      
      // Use job_category name if available, otherwise try category_id
      if (job.job_category) {
        const categoryName = typeof job.job_category === 'string' 
          ? job.job_category 
          : job.job_category.name;
        if (categoryName) {
          queryParams.job_category = categoryName;
        }
      }
      if (job.city_id) {
        queryParams.city_id = job.city_id;
      }
      
      const jobs = await jobAPI.getAllJobs(queryParams);
      // Filter out current job
      const filtered = jobs.filter(j => j.id !== job.id).slice(0, 5);
      setRelatedJobs(filtered);
    } catch (error) {
      console.error('Error fetching related jobs:', error);
    }
  };

  const fetchApplicationCount = async () => {
    try {
      if (!job?.id) return;
      // Try to get applications count, but don't fail if endpoint doesn't exist
      try {
        const response = await axios.get(`${API_URL}/api/applications/`, {
          params: { job_id: job.id, limit: 1000 }
        });
        setApplicationCount(response.data?.length || 0);
      } catch (err: any) {
        // If 403 or 404, applications might be private - just show 0
        if (err.response?.status === 403 || err.response?.status === 404) {
          setApplicationCount(0);
        }
      }
    } catch (error) {
      // Silent fail - application count is optional
      console.error('Error fetching application count:', error);
    }
  };

  const trackView = async () => {
    try {
      if (job?.id) {
        await axios.post(`${API_URL}/api/jobs/${job.id}/track-view`);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 14) return '1 week ago';
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    if (daysAgo < 60) return '1 month ago';
    return `${Math.floor(daysAgo / 30)}+ months ago`;
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return 'Not Disclosed';
    const formatAmount = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${(amount / 1000).toFixed(0)}k`;
    };
    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)} PA`;
    }
    if (job.salary_min) return `${formatAmount(job.salary_min)}+ PA`;
    if (job.salary_max) return `Up to ${formatAmount(job.salary_max)} PA`;
    return 'Not Disclosed';
  };

  const formatExperience = () => {
    if (!job?.experience_years_min && !job?.experience_years_max) return null;
    if (job.experience_years_min && job.experience_years_max) {
      return `${job.experience_years_min} - ${job.experience_years_max} years`;
    }
    if (job.experience_years_min) return `${job.experience_years_min}+ years`;
    if (job.experience_years_max) return `0 - ${job.experience_years_max} years`;
    return null;
  };

  const formatApplicationCount = () => {
    if (applicationCount === 0) return null;
    if (applicationCount >= 100) return '100+';
    return applicationCount.toString();
  };

  const parseSkills = (skillsString?: string): string[] => {
    if (!skillsString) return [];
    // Handle comma-separated or newline-separated skills
    return skillsString.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  };

  const parseResponsibilities = (responsibilitiesString?: string): string[] => {
    if (!responsibilitiesString) return [];
    // Handle bullet points or newline-separated items
    return responsibilitiesString
      .split(/\n/)
      .map(s => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Link href="/jobs" className="text-blue-600 hover:underline">
            Browse all jobs
          </Link>
        </div>
      </div>
    );
  }

  const locationParts = [
    job.area?.name,
    job.city?.name,
    job.state?.name,
  ].filter(Boolean);

  const skills = parseSkills(job.key_skills);
  const responsibilities = parseResponsibilities(job.responsibilities);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              {/* Employer Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {job.spa?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{job.spa?.name || 'SPA'}</h2>
                  {job.spa?.rating !== undefined && job.spa?.reviews !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-700">{job.spa.rating.toFixed(1)}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(job.spa.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({job.spa.reviews} Reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Job Details */}
              <div className="flex flex-wrap items-center gap-6 text-sm mb-4 pb-4 border-b border-gray-200">
                {formatExperience() && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{formatExperience()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{formatSalary()}</span>
                </div>
                {locationParts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{locationParts.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Application Metrics & Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Posted: {formatDate(job.created_at)}</span>
                  {job.job_opening_count && (
                    <span>Openings: {job.job_opening_count}</span>
                  )}
                  {formatApplicationCount() && (
                    <span>Applicants: {formatApplicationCount()}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!user ? (
                    <>
                      <button
                        onClick={() => router.push(`/register?redirect=/jobs/${job.slug}`)}
                        className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Register to apply
                      </button>
                      <button
                        onClick={() => router.push(`/login?redirect=/jobs/${job.slug}`)}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Login to apply
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/apply/${job.slug}`}
                      onClick={() => axios.post(`${API_URL}/api/jobs/${job.id}/track-apply-click`).catch(() => {})}
                      className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Job Attributes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.job_category && (
                  <div>
                    <span className="text-sm text-gray-600">Role Category:</span>
                    <p className="font-medium text-gray-900">{job.job_category.name || job.job_category}</p>
                  </div>
                )}
                {job.Industry_type && (
                  <div>
                    <span className="text-sm text-gray-600">Industry Type:</span>
                    <p className="font-medium text-gray-900">{job.Industry_type}</p>
                  </div>
                )}
                {job.job_type && (
                  <div>
                    <span className="text-sm text-gray-600">Department:</span>
                    <p className="font-medium text-gray-900">{typeof job.job_type === 'string' ? job.job_type : job.job_type.name}</p>
                  </div>
                )}
                {job.Employee_type && (
                  <div>
                    <span className="text-sm text-gray-600">Employment Type:</span>
                    <p className="font-medium text-gray-900">{job.Employee_type}</p>
                  </div>
                )}
                {job.job_category && (
                  <div>
                    <span className="text-sm text-gray-600">Role:</span>
                    <p className="font-medium text-gray-900">{job.job_category.name || job.job_category}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Jobs you might be interested in */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Jobs you might be interested in
                </h3>
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <Link key={relatedJob.id} href={`/jobs/${relatedJob.slug}`} className="block">
                      <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {relatedJob.spa?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                              {relatedJob.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {relatedJob.spa?.name || 'SPA'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {[
                                relatedJob.area?.name,
                                relatedJob.city?.name,
                              ].filter(Boolean).join(', ') || 'Location not specified'}
                            </p>
                            {relatedJob.spa?.rating !== undefined && relatedJob.spa?.reviews !== undefined && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {relatedJob.spa.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({relatedJob.spa.reviews} reviews)
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Posted {formatDate(relatedJob.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SPA Info */}
            {job.spa && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">About SPA</h3>
                <div className="space-y-3">
                  <Link href={`/spas/${job.spa.slug}`} className="text-lg font-medium text-blue-600 hover:underline block">
                    {job.spa.name}
                  </Link>
                  {job.spa.address && (
                    <p className="text-sm text-gray-600">{job.spa.address}</p>
                  )}
                  <Link
                    href={`/spas/${job.spa.slug}`}
                    className="block text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    View SPA Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
