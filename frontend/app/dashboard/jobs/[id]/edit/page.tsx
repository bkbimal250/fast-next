'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, Job, JobType, JobCategory, spaAPI, Spa, locationAPI } from '@/lib/job';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EditJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [spas, setSpas] = useState<Spa[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_years_min: '',
    experience_years_max: '',
    spa_id: '',
    job_type_id: '',
    job_category_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    area_id: '',
    hr_contact_name: '',
    hr_contact_email: '',
    hr_contact_phone: '',
    is_active: true,
    is_featured: false,
    expires_at: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    } else if (jobId) {
      fetchJob();
      fetchInitialData();
    }
  }, [user, router, jobId]);

  useEffect(() => {
    if (formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      locationAPI.getCities(parseInt(formData.state_id)).then(setCities).catch(console.error);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.city_id) {
      locationAPI.getAreas(parseInt(formData.city_id)).then(setAreas).catch(console.error);
    }
  }, [formData.city_id]);

  const fetchInitialData = async () => {
    try {
      const [spasData, typesData, categoriesData, countriesData] = await Promise.all([
        spaAPI.getSpas(),
        jobAPI.getJobTypes(),
        jobAPI.getJobCategories(),
        locationAPI.getCountries(),
      ]);
      setSpas(spasData);
      setJobTypes(typesData);
      setJobCategories(categoriesData);
      setCountries(countriesData);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  };

  const fetchJob = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await jobAPI.getJobById(jobId);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        requirements: data.requirements || '',
        salary_min: data.salary_min?.toString() || '',
        salary_max: data.salary_max?.toString() || '',
        salary_currency: data.salary_currency || 'INR',
        experience_years_min: data.experience_years_min?.toString() || '',
        experience_years_max: data.experience_years_max?.toString() || '',
        spa_id: data.spa_id?.toString() || '',
        job_type_id: data.job_type_id?.toString() || '',
        job_category_id: data.job_category_id?.toString() || '',
        country_id: data.country_id?.toString() || '',
        state_id: data.state_id?.toString() || '',
        city_id: data.city_id?.toString() || '',
        area_id: data.area_id?.toString() || '',
        hr_contact_name: data.hr_contact_name || '',
        hr_contact_email: data.hr_contact_email || '',
        hr_contact_phone: data.hr_contact_phone || '',
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString().split('T')[0] : '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch job');
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        title: formData.title || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        salary_currency: formData.salary_currency || undefined,
        experience_years_min: formData.experience_years_min ? parseInt(formData.experience_years_min) : undefined,
        experience_years_max: formData.experience_years_max ? parseInt(formData.experience_years_max) : undefined,
        spa_id: formData.spa_id ? parseInt(formData.spa_id) : undefined,
        job_type_id: formData.job_type_id ? parseInt(formData.job_type_id) : undefined,
        job_category_id: formData.job_category_id ? parseInt(formData.job_category_id) : undefined,
        country_id: formData.country_id ? parseInt(formData.country_id) : undefined,
        state_id: formData.state_id ? parseInt(formData.state_id) : undefined,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
        area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
        hr_contact_name: formData.hr_contact_name || undefined,
        hr_contact_email: formData.hr_contact_email || undefined,
        hr_contact_phone: formData.hr_contact_phone || undefined,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        expires_at: formData.expires_at || undefined,
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await jobAPI.updateJob(jobId, updateData);
      setSuccess('Job updated successfully!');
      setTimeout(() => {
        router.push(`/dashboard/jobs/${jobId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update job');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600 mt-2">Update job information</p>
          </div>
          <Link href={`/dashboard/jobs/${jobId}`} className="btn-secondary">
            Back to View
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="input-field"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="spa_id" className="block text-sm font-medium text-gray-700">
                  SPA <span className="text-red-500">*</span>
                </label>
                <select
                  id="spa_id"
                  name="spa_id"
                  value={formData.spa_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select SPA</option>
                  {spas.map((spa) => (
                    <option key={spa.id} value={spa.id}>
                      {spa.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <select
                  id="job_type_id"
                  name="job_type_id"
                  value={formData.job_type_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Job Type</option>
                  {jobTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="job_category_id" className="block text-sm font-medium text-gray-700">
                  Job Category
                </label>
                <select
                  id="job_category_id"
                  name="job_category_id"
                  value={formData.job_category_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Job Category</option>
                  {jobCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary & Experience */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Salary & Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700">
                  Min Salary
                </label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700">
                  Max Salary
                </label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="salary_currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="salary_currency"
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience_years_min" className="block text-sm font-medium text-gray-700">
                  Min Experience (years)
                </label>
                <input
                  type="number"
                  id="experience_years_min"
                  name="experience_years_min"
                  value={formData.experience_years_min}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="experience_years_max" className="block text-sm font-medium text-gray-700">
                  Max Experience (years)
                </label>
                <input
                  type="number"
                  id="experience_years_max"
                  name="experience_years_max"
                  value={formData.experience_years_max}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country_id"
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state_id"
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={!formData.country_id}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city_id"
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={!formData.state_id}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="area_id" className="block text-sm font-medium text-gray-700">
                  Area
                </label>
                <select
                  id="area_id"
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!formData.city_id}
                >
                  <option value="">Select Area (Optional)</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* HR Contact */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">HR Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hr_contact_name" className="block text-sm font-medium text-gray-700">
                  HR Name
                </label>
                <input
                  type="text"
                  id="hr_contact_name"
                  name="hr_contact_name"
                  value={formData.hr_contact_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="hr_contact_email" className="block text-sm font-medium text-gray-700">
                  HR Email
                </label>
                <input
                  type="email"
                  id="hr_contact_email"
                  name="hr_contact_email"
                  value={formData.hr_contact_email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="hr_contact_phone" className="block text-sm font-medium text-gray-700">
                  HR Phone
                </label>
                <input
                  type="tel"
                  id="hr_contact_phone"
                  name="hr_contact_phone"
                  value={formData.hr_contact_phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                  Expires At
                </label>
                <input
                  type="date"
                  id="expires_at"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link href={`/dashboard/jobs/${jobId}`} className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

