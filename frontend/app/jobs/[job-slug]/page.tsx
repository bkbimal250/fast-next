'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import axios from 'axios';
import Link from 'next/link';
import JobCard from '@/components/JobCard';
import { FaBriefcase, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaEye, FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle, FaBuilding } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface JobWithRelations extends Job {
  spa?: Spa & {
    rating?: number;
    reviews?: number;
    logo_image?: string;
  };
  job_type?: { id: number; name: string; slug: string };
  job_category?: { id: number; name: string; slug: string };
  state?: { id: number; name: string };
  city?: { id: number; name: string };
  area?: { id: number; name: string };
  created_by_user?: {
    id: number;
    name: string;
    profile_photo?: string;
    email?: string;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params['job-slug']) {
      fetchJob();
      fetchPopularJobs();
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
      if (data.spa_id && (!data.spa || !(data.spa as any).rating)) {
        try {
          const spaData = await spaAPI.getSpaById(data.spa_id);
          setJob(prev => prev ? { ...prev, spa: { ...prev.spa, ...spaData } as any } : null);
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
        limit: 6,
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

  const fetchPopularJobs = async () => {
    try {
      const jobs = await jobAPI.getPopularJobs(5);
      setPopularJobs(jobs);
    } catch (error) {
      console.error('Error fetching popular jobs:', error);
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
        // If 401, 403, or 404, applications might be private or require auth - just show 0
        if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
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

  // Get logo URL
  const getLogoUrl = (logoImage?: string) => {
    if (!logoImage) return null;
    return `${API_URL}${logoImage.startsWith('/') ? logoImage : `/${logoImage}`}`;
  };

  // Get initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return 'SP';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <Link href="/jobs" className="text-brand-600 hover:underline">
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
  const logoUrl = getLogoUrl(job.spa?.logo_image);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com';
  const jobUrl = `${siteUrl}/jobs/${job.slug}`;

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: `${siteUrl}/jobs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job.title,
        item: jobUrl,
      },
    ],
  };

  // Generate structured data (JSON-LD) for SEO
  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    validThrough: job.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.Employee_type || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.spa?.name || 'SPA',
      ...(logoUrl && { logo: logoUrl }),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city?.name || '',
        addressRegion: job.state?.name || '',
        addressCountry: job.country?.name || 'IN',
        ...(job.spa?.address && { streetAddress: job.spa.address }),
      },
    },
    ...(job.salary_min && job.salary_max && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency || 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: 'MONTH',
        },
      },
    }),
    ...(job.experience_years_min && {
      experienceRequirements: {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: job.experience_years_min * 12,
      },
    }),
    ...(job.key_skills && {
      skills: job.key_skills.split(',').map(s => s.trim()).filter(Boolean),
    }),
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4">
                <div className="flex items-start gap-4">
                  {/* SPA Logo */}
                  <div className="flex-shrink-0">
                    {logoUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white flex items-center justify-center">
                        <Image
                          src={logoUrl}
                          alt={job.spa?.name || 'SPA Logo'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-brand-600 font-bold text-xl shadow-lg border-2 border-white">
                        {getInitials(job.spa?.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">{job.title}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-base font-semibold text-white/90">{job.spa?.name || 'SPA'}</h2>
                      {(job.spa as any)?.rating !== undefined && (job.spa as any)?.reviews !== undefined && (
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                          <span className="text-sm font-semibold text-white">{((job.spa as any).rating as number).toFixed(1)}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => {
                              const rating = Math.round((job.spa as any).rating || 0);
                              const isFull = i < rating;
                              const isHalf = i === rating - 0.5;
                              return isFull ? (
                                <div key={i} className="text-yellow-300">
                                  <FaStar size={14} />
                                </div>
                              ) : isHalf ? (
                                <div key={i} className="text-yellow-300">
                                  <FaStarHalfAlt size={14} />
                                </div>
                              ) : (
                                <div key={i} className="text-white/40">
                                  <FaRegStar size={14} />
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-white/80">({(job.spa as any).reviews})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="p-6">
                {/* Key Job Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-200">
                  {formatExperience() && (
                    <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
                      <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
                        <FaBriefcase size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Experience</p>
                        <p className="text-sm font-semibold text-gray-900">{formatExperience()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gold-50 rounded-lg border border-gold-200">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gold-600">
                      <FaDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Salary</p>
                      <p className="text-sm font-semibold text-gray-900">{formatSalary()}</p>
                    </div>
                  </div>
                  {locationParts.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-600">
                        <FaMapMarkerAlt size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{locationParts.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Posted By & Metrics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-gray-200">
                  {job.created_by_user && (
                    <div className="flex items-center gap-3">
                      {job.created_by_user.profile_photo ? (
                        <Image
                          src={`${API_URL}${job.created_by_user.profile_photo.startsWith('/') ? job.created_by_user.profile_photo : `/${job.created_by_user.profile_photo}`}`}
                          alt={job.created_by_user.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border-2 border-brand-200"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-brand-200">
                          {getInitials(job.created_by_user.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Posted by</p>
                        <p className="text-sm font-semibold text-gray-900">{job.created_by_user.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <FaCalendarAlt size={14} />
                      <span className="text-gray-600">Posted {formatDate(job.created_at)}</span>
                    </span>
                    {job.job_opening_count && (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <FaUsers size={14} />
                        <span className="text-gray-600">{job.job_opening_count} {job.job_opening_count === 1 ? 'opening' : 'openings'}</span>
                      </span>
                    )}
                    {formatApplicationCount() && (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <FaUsers size={14} />
                        <span className="text-gray-600">{formatApplicationCount()} applicants</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <FaEye size={14} />
                      <span className="text-gray-600">{job.view_count} views</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!user ? (
                    <>
                      <Link
                        href={`/apply/${job.slug}`}
                        onClick={() => axios.post(`${API_URL}/api/jobs/${job.id}/track-apply-click`).catch(() => {})}
                        className="flex-1 px-6 py-3 border-2 border-brand-600 text-brand-600 font-semibold rounded-lg hover:bg-brand-50 transition-colors text-center min-h-[48px] flex items-center justify-center"
                      >
                        Quick Apply
                      </Link>
                      <button
                        onClick={() => router.push(`/login?redirect=/jobs/${job.slug}`)}
                        className="flex-1 px-6 py-3 bg-gold-500 text-white font-semibold rounded-lg hover:bg-gold-600 transition-colors shadow-md min-h-[48px]"
                      >
                        Login to Apply
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/apply/${job.slug}`}
                      onClick={() => axios.post(`${API_URL}/api/jobs/${job.id}/track-apply-click`).catch(() => {})}
                      className="flex-1 px-8 py-3.5 bg-gold-500 text-white font-semibold rounded-lg hover:bg-gold-600 transition-colors shadow-md text-center min-h-[48px] flex items-center justify-center text-base"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaBriefcase size={18} />
                </div>
                Job Description
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="text-brand-600">
                    <FaCheckCircle size={18} />
                  </div>
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5 text-gray-700">
                  {responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brand-500 mt-1.5 flex-shrink-0 font-bold">•</span>
                      <span className="leading-relaxed text-sm">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="text-brand-600">
                    <FaCheckCircle size={18} />
                  </div>
                  Requirements
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Job Details & Skills Combined */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaBuilding size={18} />
                </div>
                Job Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {job.job_category && (
                  <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <span className="text-xs text-gray-600 block mb-1">Category</span>
                    <p className="text-sm font-semibold text-gray-900">{typeof job.job_category === 'string' ? job.job_category : job.job_category.name}</p>
                  </div>
                )}
                {job.Industry_type && (
                  <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <span className="text-xs text-gray-600 block mb-1">Industry</span>
                    <p className="text-sm font-semibold text-gray-900">{job.Industry_type}</p>
                  </div>
                )}
                {job.job_type && (
                  <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <span className="text-xs text-gray-600 block mb-1">Type</span>
                    <p className="text-sm font-semibold text-gray-900">{typeof job.job_type === 'string' ? job.job_type : job.job_type.name}</p>
                  </div>
                )}
                {job.Employee_type && (
                  <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <span className="text-xs text-gray-600 block mb-1">Employment</span>
                    <p className="text-sm font-semibold text-gray-900">{job.Employee_type}</p>
                  </div>
                )}
              </div>
              
              {/* Key Skills */}
              {skills.length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium border border-brand-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Popular Jobs */}
            {popularJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="text-gold-500">
                    <FaStar size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Popular Jobs</h3>
                </div>
                <div className="space-y-3">
                  {popularJobs.filter(j => j.id !== job.id).slice(0, 4).map((popularJob) => {
                    const popularLogoUrl = getLogoUrl(popularJob.spa?.logo_image);
                    return (
                      <Link key={popularJob.id} href={`/jobs/${popularJob.slug}`} className="block group">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-md transition-all bg-white">
                          <div className="flex items-start gap-3">
                            {popularLogoUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                <Image
                                  src={popularLogoUrl}
                                  alt={popularJob.spa?.name || 'SPA Logo'}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-200">
                                {getInitials(popularJob.spa?.name)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors text-sm leading-tight">
                                {popularJob.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1.5">
                                {popularJob.spa?.name || 'SPA'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {popularJob.salary_min && (
                                  <span className="font-medium text-green-600">
                                    ₹{(popularJob.salary_min / 1000).toFixed(0)}k+
                                  </span>
                                )}
                                <span>•</span>
                                <span>
                                  {[popularJob.area?.name, popularJob.city?.name].filter(Boolean).join(', ') || 'Location'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Similar Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="text-brand-500">
                    <FaBriefcase size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Similar Jobs</h3>
                </div>
                <div className="space-y-3">
                  {relatedJobs.map((relatedJob) => {
                    const relatedLogoUrl = getLogoUrl(relatedJob.spa?.logo_image);
                    return (
                      <Link key={relatedJob.id} href={`/jobs/${relatedJob.slug}`} className="block group">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-md transition-all bg-white">
                          <div className="flex items-start gap-3">
                            {relatedLogoUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                <Image
                                  src={relatedLogoUrl}
                                  alt={relatedJob.spa?.name || 'SPA Logo'}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-200">
                                {getInitials(relatedJob.spa?.name)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors text-sm leading-tight">
                                {relatedJob.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1.5">
                                {relatedJob.spa?.name || 'SPA'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                {relatedJob.salary_min && (
                                  <span className="font-medium text-green-600">
                                    ₹{(relatedJob.salary_min / 1000).toFixed(0)}k+
                                  </span>
                                )}
                                <span>•</span>
                                <span>
                                  {[relatedJob.area?.name, relatedJob.city?.name].filter(Boolean).join(', ') || 'Location'}
                                </span>
                              </div>
                              {(relatedJob.spa as any)?.rating !== undefined && (relatedJob.spa as any)?.reviews !== undefined && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    {((relatedJob.spa as any).rating as number).toFixed(1)}
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => {
                                      const rating = Math.round((relatedJob.spa as any)?.rating || 0);
                                      return i < rating ? (
                                        <div key={i} className="text-yellow-400">
                                          <FaStar size={12} />
                                        </div>
                                      ) : (
                                        <div key={i} className="text-gray-300">
                                          <FaRegStar size={12} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    ({(relatedJob.spa as any).reviews})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SPA Info */}
            {job.spa && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="text-brand-600">
                    <FaBuilding size={16} />
                  </div>
                  About the Company
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <Image
                          src={logoUrl}
                          alt={job.spa.name || 'SPA Logo'}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border border-gray-200">
                        {getInitials(job.spa.name)}
                      </div>
                    )}
                    <div>
                      <Link href={`/spas/${job.spa.slug}`} className="text-lg font-semibold text-brand-600 hover:underline block">
                        {job.spa.name}
                      </Link>
                      {(job.spa as any)?.rating !== undefined && (job.spa as any)?.reviews !== undefined && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm font-medium text-gray-700">{((job.spa as any).rating as number).toFixed(1)}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => {
                              const rating = Math.round((job.spa as any).rating || 0);
                              return i < rating ? (
                                <div key={i} className="text-yellow-400">
                                  <FaStar size={14} />
                                </div>
                              ) : (
                                <div key={i} className="text-gray-300">
                                  <FaRegStar size={14} />
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-600">({(job.spa as any).reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {job.spa.address && (
                    <p className="text-sm text-gray-600 leading-relaxed">{job.spa.address}</p>
                  )}
                  <Link
                    href={`/spas/${job.spa.slug}`}
                    className="block text-center px-4 py-2.5 border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 text-sm font-semibold transition-colors"
                  >
                    View Company Profile
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
