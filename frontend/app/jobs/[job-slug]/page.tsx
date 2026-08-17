'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MessageForm from '@/components/MessageForm';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import { applicationAPI } from '@/lib/application';
import axios from 'axios';
import Link from 'next/link';
import { showToast, showErrorToast } from '@/lib/toast';
import CategoryLocationSearch from './CategoryLocationSearch';
import RoleLandingPage from '@/components/RoleLandingPage';
import { getRoleLandingPage } from '@/lib/content/seo-pages';
import {
  JobHeader,
  JobDetailsCard,
  JobActions,
  JobDescription,
  JobResponsibilities,
  JobRequirements,
  JobDetailsAndSkills,
  CompanyInfo,
  RelatedJobsList,
  PopularJobsList,
  JobWithRelations,
  parseSkills,
  parseResponsibilities,
} from '@/components/job-detail';
import { FaArrowLeft, FaBriefcase, FaCheckCircle } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const slug = params?.['job-slug'] as string;

  // Handle SEO Search Route Detection
  if (slug?.includes('-jobs-in-')) {
    return <CategoryLocationSearch slug={slug} />;
  }

  if (slug && getRoleLandingPage(slug)) {
    return <RoleLandingPage slug={slug} />;
  }

  useEffect(() => {
    if (slug) {
      fetchJob();
      fetchPopularJobs();
    }
  }, [slug]);

  useEffect(() => {
    if (job) {
      trackView();
      fetchRelatedJobs();
      fetchApplicationCount();
    }
  }, [job]);

  // Show popup after 10 seconds when job is loaded
  useEffect(() => {
    if (job && !loading) {
      const timer = setTimeout(() => {
        setShowMessagePopup(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [job, loading]);

  const fetchJob = async () => {
    try {
      if (!slug) return;
      const data = await jobAPI.getJobBySlug(slug);
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
      const jobs = await jobAPI.getRelatedJobs(job.id, 5);
      setRelatedJobs(jobs);
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
      try {
        const response = await axios.get(`${API_URL}/api/applications/`, {
          params: { job_id: job.id, limit: 1000 }
        });
        setApplicationCount(response.data?.length || 0);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
          setApplicationCount(0);
        }
      }
    } catch (error) {
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

  const handleDirectApply = async () => {
    if (!job || !user) return;

    setApplying(true);
    try {
      await axios.post(`${API_URL}/api/jobs/${job.id}/track-apply-click`).catch(() => { });
      await applicationAPI.directApply(job.id);
      showToast.success('Application submitted successfully!');
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to submit application. Please try again.';
      showErrorToast(err, errorMessage);
    } finally {
      setApplying(false);
    }
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

  const skills = parseSkills(job.key_skills);
  const responsibilities = parseResponsibilities(job.responsibilities);

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />

      {/* Message Form Popup */}
      {showMessagePopup && job && (
        <MessageForm
          jobId={job.id}
          jobTitle={job.title}
          isPopup={true}
          onClose={() => setShowMessagePopup(false)}
          onSuccess={() => {
            setShowMessagePopup(false);
          }}
        />
      )}

      <main className="page-shell py-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
          >
            <FaArrowLeft size={12} />
            Back to jobs
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
            <FaCheckCircle size={12} />
            Verified job details
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
          <div className="space-y-5">
            <JobHeader job={job} />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <JobDetailsCard job={job} applicationCount={applicationCount} />
            </div>

            {job.description && <JobDescription description={job.description} />}

            <JobResponsibilities responsibilities={responsibilities} />

            {job.requirements && <JobRequirements requirements={job.requirements} />}

            <JobDetailsAndSkills
              jobCategory={job.job_category}
              industryType={job.Industry_type}
              jobType={job.job_type}
              employeeType={job.Employee_type}
              requiredGender={job.required_gender}
              benefits={job.benefits}
              jobTiming={job.job_timing}
              skills={skills}
            />
          </div>

          <aside className="space-y-5">
            <div className="sticky top-20 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <FaBriefcase size={17} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">Apply for this job</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      Review the details and apply directly. Contact options appear when the employer has shared them.
                    </p>
                  </div>
                </div>
                <JobActions
                  job={job}
                  user={user}
                  applying={applying}
                  onApply={handleDirectApply}
                />
              </div>

              <CompanyInfo job={job} />

              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
                <h3 className="text-base font-bold text-slate-950">Hiring for your spa?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Add your business first, then post jobs linked to your spa profile.
                </p>
                <Link
                  href="/free-listing"
                  className="mt-4 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-800"
                >
                  Create free listing
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <RelatedJobsList jobs={relatedJobs} currentJobId={job.id} />
          <PopularJobsList jobs={popularJobs} currentJobId={job.id} />
        </div>
      </main>
    </div>
  );
}
