'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job, JobType, JobCategory } from '@/lib/job';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type TabType = 'jobs' | 'types' | 'categories';

export default function ManageJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);

  // Inline form states
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inlineFormData, setInlineFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    } else {
      fetchData();
    }
  }, [user, router, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'jobs':
          // For recruiters, use recruiter-specific endpoint
          if (user?.role === 'recruiter') {
            setJobs(await jobAPI.getMyJobs());
          } else {
            setJobs(await jobAPI.getAllJobs());
          }
          break;
        case 'types':
          setJobTypes(await jobAPI.getJobTypes());
          break;
        case 'categories':
          setJobCategories(await jobAPI.getJobCategories());
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInlineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInlineFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInlineSubmit = async (saveAndAddAnother: boolean = false) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'types') {
        await jobAPI.createJobType({
          name: inlineFormData.name,
          description: inlineFormData.description || undefined,
        });
        setSuccess('Job type created successfully!');
      } else if (activeTab === 'categories') {
        await jobAPI.createJobCategory({
          name: inlineFormData.name,
          description: inlineFormData.description || undefined,
        });
        setSuccess('Job category created successfully!');
      }

      await fetchData();

      if (saveAndAddAnother) {
        setInlineFormData({ name: '', description: '' });
        setSuccess(`${activeTab === 'types' ? 'Job type' : 'Job category'} created! Add another?`);
      } else {
        setShowInlineForm(false);
        setInlineFormData({ name: '', description: '' });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to create ${activeTab.slice(0, -1)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: 'types' | 'categories', id: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'types' ? 'job type' : 'job category'}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (type === 'types') {
        await jobAPI.deleteJobType(id);
        setJobTypes(jobTypes.filter((t) => t.id !== id));
      } else {
        await jobAPI.deleteJobCategory(id);
        setJobCategories(jobCategories.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to delete ${type.slice(0, -1)}`);
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-2">Manage jobs, job types, and categories</p>
          </div>
          {activeTab === 'jobs' && (
            <Link href="/dashboard/jobs/create" className="btn-primary">
              Post New Job
            </Link>
          )}
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        {/* Tabs - Only show for admin/manager, recruiters only see jobs */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['jobs', 'types', 'categories'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowInlineForm(false);
                      setInlineFormData({ name: '', description: '' });
                      setError(null);
                      setSuccess(null);
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'jobs' ? 'Jobs' : tab === 'types' ? 'Job Types' : 'Job Categories'}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Inline Create Form for Types and Categories */}
        {(activeTab === 'types' || activeTab === 'categories') && showInlineForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-primary-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New {activeTab === 'types' ? 'Job Type' : 'Job Category'}
              </h3>
              <button
                onClick={() => {
                  setShowInlineForm(false);
                  setInlineFormData({ name: '', description: '' });
                  setError(null);
                  setSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInlineSubmit(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={inlineFormData.name}
                  onChange={handleInlineFormChange}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={inlineFormData.description}
                  onChange={handleInlineFormChange}
                  rows={3}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineForm(false);
                    setInlineFormData({ name: '', description: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleInlineSubmit(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save & Add Another'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'jobs' ? 'Jobs' : activeTab === 'types' ? 'Job Types' : 'Job Categories'}
              </h2>
              {(activeTab === 'types' || activeTab === 'categories') && !showInlineForm && (
                <button
                  onClick={() => {
                    setShowInlineForm(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="btn-primary"
                >
                  + Quick Add
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === 'jobs' && (
                  <>
                    {jobs.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className="mb-4">No jobs found</p>
                        <Link href="/dashboard/jobs/create" className="btn-primary inline-block">
                          Create First Job
                        </Link>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SPA
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Views
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                <div className="text-sm text-gray-500">{job.slug}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                SPA #{job.spa_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {job.salary_min && job.salary_max
                                  ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                  : job.salary_min
                                  ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()}+`
                                  : 'Not specified'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {job.view_count || 0} views
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                                      job.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {job.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                  {job.is_featured && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 inline-block w-fit">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Link
                                    href={`/dashboard/jobs/${job.id}`}
                                    className="text-primary-600 hover:text-primary-900"
                                    title="View"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </Link>
                                  <Link
                                    href={`/dashboard/jobs/${job.id}/edit`}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Link>
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to delete this job?')) {
                                          try {
                                            await jobAPI.deleteJob(job.id);
                                            fetchData();
                                          } catch (err: any) {
                                            setError(err.response?.data?.detail || 'Failed to delete job');
                                          }
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-900"
                                      title="Delete"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}

                {activeTab === 'types' && (
                  <>
                    {jobTypes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">No job types found</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {jobTypes.map((jobType) => (
                            <tr key={jobType.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{jobType.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {jobType.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jobType.slug}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {jobType.description || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDelete('types', jobType.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}

                {activeTab === 'categories' && (
                  <>
                    {jobCategories.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">No job categories found</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {jobCategories.map((category) => (
                            <tr key={category.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {category.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {category.description || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDelete('categories', category.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

