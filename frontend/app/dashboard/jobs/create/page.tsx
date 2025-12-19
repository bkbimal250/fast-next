'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, JobType, JobCategory } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateJobPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  // Searchable SPA dropdown state
  const [spaSearchTerm, setSpaSearchTerm] = useState('');
  const [showSpaDropdown, setShowSpaDropdown] = useState(false);
  const spaDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    job_type_id: '',
    job_category_id: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_years_min: '',
    experience_years_max: '',
    spa_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    area_id: '',
    hr_contact_name: '',
    hr_contact_email: '',
    hr_contact_phone: '',
    is_featured: false,
    expires_at: '',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    } else {
      fetchData();
    }
  }, [user, router]);

  // Close SPA dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (spaDropdownRef.current && !spaDropdownRef.current.contains(event.target as Node)) {
        setShowSpaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update spa search term when spa_id changes
  useEffect(() => {
    if (formData.spa_id && spas.length > 0) {
      const selected = spas.find((spa) => spa.id.toString() === formData.spa_id);
      if (selected) {
        setSpaSearchTerm(selected.name);
      }
    }
  }, [formData.spa_id, spas]);

  useEffect(() => {
    if (formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
      setFormData((prev) => ({ ...prev, state_id: '', city_id: '', area_id: '' }));
      setCities([]);
      setAreas([]);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      locationAPI.getCities(parseInt(formData.state_id)).then(setCities).catch(console.error);
      setFormData((prev) => ({ ...prev, city_id: '', area_id: '' }));
      setAreas([]);
    }
  }, [formData.state_id]);

  useEffect(() => {
    if (formData.city_id) {
      locationAPI.getAreas(parseInt(formData.city_id)).then(setAreas).catch(console.error);
      setFormData((prev) => ({ ...prev, area_id: '' }));
    }
  }, [formData.city_id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // For recruiters, fetch only their own SPA
      if (user?.role === 'recruiter') {
        try {
          const spaData = await spaAPI.getMySpa();
          setSpas([spaData]);
          setFormData((prev) => ({ ...prev, spa_id: spaData.id.toString() }));
          const [countriesData, typesData, categoriesData] = await Promise.all([
            locationAPI.getCountries(),
            jobAPI.getJobTypes(),
            jobAPI.getJobCategories(),
          ]);
          setCountries(countriesData);
          setJobTypes(typesData);
          setJobCategories(categoriesData);
        } catch (spaError: any) {
          const [countriesData, typesData, categoriesData] = await Promise.all([
            locationAPI.getCountries(),
            jobAPI.getJobTypes(),
            jobAPI.getJobCategories(),
          ]);
          setCountries(countriesData);
          setJobTypes(typesData);
          setJobCategories(categoriesData);
          if (spaError.response?.status === 404) {
            setError('You need to create a business first before posting jobs. Please create a business from the dashboard.');
          } else {
            setError('Failed to load your business. Please try again.');
          }
        }
      } else {
        // For admin/manager, fetch all SPAs
        const [spasData, countriesData, typesData, categoriesData] = await Promise.all([
          spaAPI.getSpas(),
          locationAPI.getCountries(),
          jobAPI.getJobTypes(),
          jobAPI.getJobCategories(),
        ]);
        setSpas(spasData);
        setCountries(countriesData);
        setJobTypes(typesData);
        setJobCategories(categoriesData);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.detail || 'Failed to load data. Please try again.');
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

  // Filtered SPAs based on search term
  const filteredSpas = spas.filter((spa) =>
    spa.name.toLowerCase().includes(spaSearchTerm.toLowerCase())
  );

  const handleSpaSelect = (spa: Spa) => {
    setFormData((prev) => ({ ...prev, spa_id: spa.id.toString() }));
    setSpaSearchTerm(spa.name);
    setShowSpaDropdown(false);
  };

  const selectedSpa = spas.find((spa) => spa.id.toString() === formData.spa_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.spa_id) {
      setError('Please select a SPA');
      setSubmitting(false);
      return;
    }

    try {
      const jobData: any = {
        ...formData,
        spa_id: parseInt(formData.spa_id),
        job_type_id: formData.job_type_id ? parseInt(formData.job_type_id) : undefined,
        job_category_id: formData.job_category_id ? parseInt(formData.job_category_id) : undefined,
        country_id: formData.country_id ? parseInt(formData.country_id) : undefined,
        state_id: formData.state_id ? parseInt(formData.state_id) : undefined,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
        area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        experience_years_min: formData.experience_years_min ? parseInt(formData.experience_years_min) : undefined,
        experience_years_max: formData.experience_years_max ? parseInt(formData.experience_years_max) : undefined,
        expires_at: formData.expires_at || undefined,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
      };

      await jobAPI.createJob(jobData);
      setSuccess('Job created successfully!');
      setTimeout(() => {
        router.push('/dashboard/jobs');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600 mt-2">Post a new job opening</p>
          </div>
          <Link href="/dashboard/jobs" className="btn-secondary">
            Back to Jobs
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
                placeholder="e.g., Senior Spa Therapist"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
                placeholder="Detailed job description..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                className="input-field"
                placeholder="Required qualifications, skills, and experience..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="job_category_id" className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* SPA & Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">SPA & Location</h2>
            
            <div>
              <label htmlFor="spa_id" className="block text-sm font-medium text-gray-700 mb-1">
                SPA <span className="text-red-500">*</span>
              </label>
              {user?.role === 'recruiter' ? (
                <select
                  id="spa_id"
                  name="spa_id"
                  value={formData.spa_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled
                >
                  {selectedSpa && <option value={selectedSpa.id}>{selectedSpa.name}</option>}
                </select>
              ) : (
                <div className="relative" ref={spaDropdownRef}>
                  <input
                    type="text"
                    id="spa_search"
                    value={spaSearchTerm}
                    onChange={(e) => {
                      setSpaSearchTerm(e.target.value);
                      setShowSpaDropdown(true);
                      if (!e.target.value) {
                        setFormData((prev) => ({ ...prev, spa_id: '' }));
                      }
                    }}
                    onFocus={() => setShowSpaDropdown(true)}
                    className="input-field"
                    placeholder={formData.spa_id ? selectedSpa?.name : "Search and select SPA..."}
                    required
                  />
                  {showSpaDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredSpas.length > 0 ? (
                        filteredSpas.map((spa) => (
                          <div
                            key={spa.id}
                            onClick={() => handleSpaSelect(spa)}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{spa.name}</div>
                            {spa.address && (
                              <div className="text-sm text-gray-500">{spa.address}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">No SPAs found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country_id"
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="input-field"
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
                <label htmlFor="state_id" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="state_id"
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="input-field"
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
                <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  id="city_id"
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="input-field"
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
                <label htmlFor="area_id" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary & Experience */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Salary & Experience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="salary_currency" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="experience_years_min" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  id="experience_years_min"
                  name="experience_years_min"
                  value={formData.experience_years_min}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="experience_years_max" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Experience (Years)
                </label>
                <input
                  type="number"
                  id="experience_years_max"
                  name="experience_years_max"
                  value={formData.experience_years_max}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* HR Contact Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">HR Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="hr_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="hr_contact_name"
                  name="hr_contact_name"
                  value={formData.hr_contact_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="hr_contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="hr_contact_email"
                  name="hr_contact_email"
                  value={formData.hr_contact_email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="hr@example.com"
                />
              </div>

              <div>
                <label htmlFor="hr_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="hr_contact_phone"
                  name="hr_contact_phone"
                  value={formData.hr_contact_phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Additional Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  id="expires_at"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Featured Job</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">SEO (Optional)</h2>
            
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
                <span className="ml-2 text-xs text-gray-500">(Max 60 characters)</span>
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="input-field"
                placeholder="SEO-friendly title for search engines"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-500">{formData.meta_title.length}/60</p>
            </div>

            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
                <span className="ml-2 text-xs text-gray-500">(Max 160 characters)</span>
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={handleChange}
                className="input-field"
                placeholder="Brief description for search engine results"
                maxLength={160}
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">{formData.meta_description.length}/160</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <button type="submit" className="btn-primary px-8 py-3 text-lg" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
