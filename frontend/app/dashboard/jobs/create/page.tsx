'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobAPI, JobType, JobCategory } from '@/lib/job';
import { spaAPI, Spa } from '@/lib/spa';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import JobFormWizard from '../components/JobFormWizard';
import JobFormStep1 from '../components/JobFormStep1';
import JobFormStep2 from '../components/JobFormStep2';

export default function CreateJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    responsibilities: '',
    benefits: '',
    job_timing: '',
    key_skills: '',
    job_opening_count: '1',
    Industry_type: 'Beauty and Spa',
    Employee_type: 'Full Time',
    required_gender: 'Female',
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
    postalCode: '',
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

  // Helper function to extract error message from API response
  const extractErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
    
    // If it's already a string, return it
    if (typeof error === 'string') return error;
    
    // Handle FastAPI/Pydantic validation errors
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // If detail is an array of validation errors
      if (Array.isArray(detail)) {
        return detail.map((err: any) => {
          const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'field';
          return `${field}: ${err.msg}`;
        }).join(', ');
      }
      
      // If detail is a string
      if (typeof detail === 'string') return detail;
    }
    
    // Fallback error messages
    if (error.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
  };

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
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.spa_id) {
      errors.spa_id = 'Please select a SPA';
    }
    if (!formData.title.trim()) {
      errors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Job description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.country_id) {
      errors.country_id = 'Please select a country';
    }
    if (!formData.state_id) {
      errors.state_id = 'Please select a state';
    }
    if (!formData.city_id) {
      errors.city_id = 'Please select a city';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepChange = (step: number) => {
    if (step < currentStep || (step === 2 && validateStep1())) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both steps before submission
    if (!validateStep1()) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!validateStep2()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setFormErrors({});

    try {
      const jobData: any = {
        ...formData,
        spa_id: parseInt(formData.spa_id),
        job_type_id: formData.job_type_id ? parseInt(formData.job_type_id) : undefined,
        job_category_id: formData.job_category_id ? parseInt(formData.job_category_id) : undefined,
        country_id: parseInt(formData.country_id), // Required field, always convert
        state_id: parseInt(formData.state_id), // Required field, always convert
        city_id: parseInt(formData.city_id), // Required field, always convert
        area_id: formData.area_id ? parseInt(formData.area_id) : undefined,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        experience_years_min: formData.experience_years_min ? parseInt(formData.experience_years_min) : undefined,
        experience_years_max: formData.experience_years_max ? parseInt(formData.experience_years_max) : undefined,
        job_opening_count: formData.job_opening_count ? parseInt(formData.job_opening_count) : 1,
        Industry_type: formData.Industry_type || 'Beauty and Spa',
        Employee_type: formData.Employee_type || 'Full Time',
        required_gender: formData.required_gender || 'Female',
        responsibilities: formData.responsibilities || undefined,
        benefits: formData.benefits || undefined,
        job_timing: formData.job_timing || undefined,
        key_skills: formData.key_skills || undefined,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
      };

      await jobAPI.createJob(jobData);
      setSuccess('Job created successfully!');
      setTimeout(() => {
        router.push('/dashboard/jobs');
      }, 1500);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || 'Failed to create job. Please check all fields and try again.');
      
      // Also set form errors if validation errors are present
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        const validationErrors: Record<string, string> = {};
        const step1Fields = ['spa_id', 'title', 'description'];
        const step2Fields = ['country_id', 'state_id', 'city_id'];
        let hasStep1Errors = false;
        let hasStep2Errors = false;
        
        err.response.data.detail.forEach((error: any) => {
          if (error.loc && error.loc.length > 0) {
            const field = error.loc[error.loc.length - 1];
            validationErrors[field] = error.msg;
            if (step1Fields.includes(field)) hasStep1Errors = true;
            if (step2Fields.includes(field)) hasStep2Errors = true;
          }
        });
        
        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          // Navigate to the appropriate step based on which errors occurred
          if (hasStep1Errors) {
            setCurrentStep(1);
          } else if (hasStep2Errors) {
            setCurrentStep(2);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCountryChange = (countryId: string) => {
    if (countryId) {
      locationAPI.getStates(parseInt(countryId)).then(setStates).catch(console.error);
      setFormData((prev) => ({ ...prev, state_id: '', city_id: '', area_id: '' }));
      setCities([]);
      setAreas([]);
    }
  };

  const handleStateChange = (stateId: string) => {
    if (stateId) {
      locationAPI.getCities(parseInt(stateId)).then(setCities).catch(console.error);
      setFormData((prev) => ({ ...prev, city_id: '', area_id: '' }));
      setAreas([]);
    }
  };

  const handleCityChange = (cityId: string) => {
    if (cityId) {
      locationAPI.getAreas(parseInt(cityId)).then(setAreas).catch(console.error);
      setFormData((prev) => ({ ...prev, area_id: '' }));
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Job Posting</h1>
              <p className="text-gray-600 mt-2">Fill in the details to post a new job opening</p>
            </div>
            <Link
              href="/dashboard/jobs"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="break-words">{typeof error === 'string' ? error : 'An error occurred. Please try again.'}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Form Wizard */}
        <form onSubmit={handleSubmit}>
          <JobFormWizard currentStep={currentStep} totalSteps={2} onStepChange={handleStepChange}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <JobFormStep1
                formData={formData}
                onFieldChange={handleFieldChange}
                spas={spas}
                jobTypes={jobTypes}
                jobCategories={jobCategories}
                userRole={user?.role}
                errors={formErrors}
              />
            )}

            {/* Step 2: Location & Details */}
            {currentStep === 2 && (
              <JobFormStep2
                formData={formData}
                onFieldChange={handleFieldChange}
                countries={countries}
                states={states}
                cities={cities}
                areas={areas}
                onCountryChange={handleCountryChange}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                errors={formErrors}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ← Previous
              </button>

              {currentStep === 2 ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Job Posting
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Next Step
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </JobFormWizard>
        </form>
      </div>
    </div>
  );
}
