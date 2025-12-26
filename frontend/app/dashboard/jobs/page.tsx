'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job, JobType, JobCategory } from '@/lib/job';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { showToast, showErrorToast } from '@/lib/toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inlineFormData, setInlineFormData] = useState({
    name: '',
    description: '',
  });

  // Delete modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: number | null;
    itemType: 'job' | 'type' | 'category' | null;
    itemName: string;
  }>({
    isOpen: false,
    itemId: null,
    itemType: null,
    itemName: '',
  });
  const [deleting, setDeleting] = useState(false);

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
      const errorMsg = err.response?.data?.detail || 'Failed to fetch data';
      setError(errorMsg);
      showErrorToast(err, 'Failed to fetch data');
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
      if (editingId) {
        // Update existing
        if (activeTab === 'types') {
          await jobAPI.updateJobType(editingId, {
            name: inlineFormData.name,
            description: inlineFormData.description || undefined,
          });
        } else if (activeTab === 'categories') {
          await jobAPI.updateJobCategory(editingId, {
            name: inlineFormData.name,
            description: inlineFormData.description || undefined,
          });
        }
        setSuccess(`${activeTab === 'types' ? 'Job type' : 'Job category'} updated successfully!`);
        setEditingId(null);
      } else {
        // Create new
        if (activeTab === 'types') {
          await jobAPI.createJobType({
            name: inlineFormData.name,
            description: inlineFormData.description || undefined,
          });
        } else if (activeTab === 'categories') {
          await jobAPI.createJobCategory({
            name: inlineFormData.name,
            description: inlineFormData.description || undefined,
          });
        }
        setSuccess(`${activeTab === 'types' ? 'Job type' : 'Job category'} created successfully!`);
      }

      await fetchData();

      const successMsg = editingId 
        ? `${activeTab === 'types' ? 'Job type' : 'Job category'} updated successfully!`
        : `${activeTab === 'types' ? 'Job type' : 'Job category'} created successfully!`;
      showToast.success(successMsg);
      
      if (saveAndAddAnother && !editingId) {
        setInlineFormData({ name: '', description: '' });
        setSuccess(`${activeTab === 'types' ? 'Job type' : 'Job category'} created! Add another?`);
      } else {
        setShowInlineForm(false);
        setEditingId(null);
        setInlineFormData({ name: '', description: '' });
        setSuccess(successMsg);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || `Failed to ${editingId ? 'update' : 'create'} ${activeTab.slice(0, -1)}`;
      setError(errorMsg);
      showErrorToast(err, `Failed to ${editingId ? 'update' : 'create'} ${activeTab.slice(0, -1)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (type: 'types' | 'categories', item: JobType | JobCategory) => {
    setEditingId(item.id);
    setInlineFormData({
      name: item.name,
      description: (item as any).description || '',
    });
    setShowInlineForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteClick = (type: 'job' | 'type' | 'category', id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemName: name,
    });
  };

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!deleteModal.itemId || !deleteModal.itemType) return;

    setDeleting(true);
    try {
      if (deleteModal.itemType === 'job') {
        await jobAPI.deleteJob(deleteModal.itemId, permanent);
        showToast.success(permanent ? 'Job permanently deleted' : 'Job deleted successfully');
        await fetchData();
      } else if (deleteModal.itemType === 'type') {
        // Job types are always permanent delete (admin only)
        await jobAPI.deleteJobType(deleteModal.itemId);
        setJobTypes(jobTypes.filter((t) => t.id !== deleteModal.itemId));
        showToast.success('Job type deleted successfully');
        await fetchData();
      } else if (deleteModal.itemType === 'category') {
        // Job categories are always permanent delete (admin only)
        await jobAPI.deleteJobCategory(deleteModal.itemId);
        setJobCategories(jobCategories.filter((c) => c.id !== deleteModal.itemId));
        showToast.success('Job category deleted successfully');
        await fetchData();
      }
      setDeleteModal({ isOpen: false, itemId: null, itemType: null, itemName: '' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || `Failed to delete ${deleteModal.itemType}`;
      setError(errorMsg);
      showErrorToast(err, `Failed to delete ${deleteModal.itemType}`);
      console.error(`Failed to delete ${deleteModal.itemType}:`, err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (type: 'types' | 'categories', id: number) => {
    // This is for backward compatibility, but we'll use the modal instead
    const item = type === 'types' 
      ? jobTypes.find(t => t.id === id)
      : jobCategories.find(c => c.id === id);
    if (item) {
      handleDeleteClick(type === 'types' ? 'type' : 'category', id, item.name);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage jobs, job types, and categories</p>
          </div>
          {activeTab === 'jobs' && (
            <Link href="/dashboard/jobs/create" className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors shadow-md text-sm sm:text-base">
              Post New Job
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-brand-50 border-l-4 border-brand-500 text-brand-700 p-4 rounded-lg mb-4">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Tabs - Only show for admin/manager, recruiters only see jobs */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="bg-white rounded-xl shadow-sm mb-5 border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['jobs', 'types', 'categories'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowInlineForm(false);
                      setEditingId(null);
                      setInlineFormData({ name: '', description: '' });
                      setError(null);
                      setSuccess(null);
                    }}
                    className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-brand-600 text-brand-600'
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
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5 border-2 border-brand-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {editingId ? `Edit ${activeTab === 'types' ? 'Job Type' : 'Job Category'}` : `Add New ${activeTab === 'types' ? 'Job Type' : 'Job Category'}`}
              </h3>
              <button
                onClick={() => {
                  setShowInlineForm(false);
                  setEditingId(null);
                  setInlineFormData({ name: '', description: '' });
                  setError(null);
                  setSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineForm(false);
                    setEditingId(null);
                    setInlineFormData({ name: '', description: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                {!editingId && (
                  <button
                    type="button"
                    onClick={() => handleInlineSubmit(true)}
                    className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save & Add Another'}
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'jobs' ? 'Jobs' : activeTab === 'types' ? 'Job Types' : 'Job Categories'}
              </h2>
              {(activeTab === 'types' || activeTab === 'categories') && !showInlineForm && (
                <button
                  onClick={() => {
                    setShowInlineForm(true);
                    setEditingId(null);
                    setInlineFormData({ name: '', description: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Quick Add
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === 'jobs' && (
                  <>
                    {jobs.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className="mb-4">No jobs found</p>
                        <Link href="/dashboard/jobs/create" className="inline-block px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors shadow-md">
                          Create First Job
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-brand-50 to-brand-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                SPA
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Salary
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Views
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {jobs.map((job) => (
                              <tr key={job.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">#{job.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                  <div className="text-xs text-gray-500 font-mono mt-1">{job.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">
                                    {job.spa?.name || `SPA #${job.spa_id}`}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">
                                    {job.salary_min && job.salary_max
                                      ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                      : job.salary_min
                                      ? `${job.salary_currency || 'INR'} ${job.salary_min.toLocaleString()}+`
                                      : <span className="text-gray-400 italic">Not specified</span>}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">{job.view_count || 0} views</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`px-2.5 py-1 text-xs rounded-full inline-block w-fit font-medium ${
                                        job.is_active
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {job.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {job.is_featured && (
                                      <span className="px-2.5 py-1 text-xs rounded-full bg-gold-100 text-gold-800 inline-block w-fit font-medium">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex justify-end gap-2">
                                    <Link
                                      href={`/dashboard/jobs/${job.id}`}
                                      className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                      title="View"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </Link>
                                    <Link
                                      href={`/dashboard/jobs/${job.id}/edit`}
                                      className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Link>
                                    {(user?.role === 'admin' || job.created_by_user?.id === user?.id) && (
                                      <button
                                        onClick={() => handleDeleteClick('job', job.id, job.title)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'types' && (
                  <>
                    {jobTypes.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 bg-white">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No job types found</p>
                        <p className="text-sm text-gray-500">Get started by creating a new job type</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-brand-50 to-brand-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Slug
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {jobTypes.map((jobType) => (
                              <tr key={jobType.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">#{jobType.id}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{jobType.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600 font-mono">{jobType.slug}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-600">
                                    {(jobType as any).description || <span className="text-gray-400 italic">N/A</span>}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit('types', jobType)}
                                      className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    {user?.role === 'admin' && (
                                      <button
                                        onClick={() => handleDeleteClick('type', jobType.id, jobType.name)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'categories' && (
                  <>
                    {jobCategories.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 bg-white">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No job categories found</p>
                        <p className="text-sm text-gray-500">Get started by creating a new job category</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-brand-50 to-brand-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Slug
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {jobCategories.map((category) => (
                              <tr key={category.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">#{category.id}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600 font-mono">{category.slug}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-600">
                                    {(category as any).description || <span className="text-gray-400 italic">N/A</span>}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit('categories', category)}
                                      className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    {user?.role === 'admin' && (
                                      <button
                                        onClick={() => handleDeleteClick('category', category.id, category.name)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null, itemType: null, itemName: '' })}
        onConfirm={handleDeleteConfirm}
        title={
          deleteModal.itemType === 'job'
            ? 'Delete Job'
            : deleteModal.itemType === 'type'
            ? 'Delete Job Type'
            : 'Delete Job Category'
        }
        message={
          deleteModal.itemType === 'job'
            ? 'Are you sure you want to delete this job?'
            : `Are you sure you want to delete this ${deleteModal.itemType === 'type' ? 'job type' : 'job category'}? This action cannot be undone.`
        }
        itemName={deleteModal.itemName}
        isAdmin={user?.role === 'admin'}
        isPermanentDelete={deleteModal.itemType === 'type' || deleteModal.itemType === 'category'}
        loading={deleting}
      />
    </div>
  );
}

