'use client';

import { JobType, JobCategory } from '@/lib/job';
import { Spa } from '@/lib/spa';
import SpaSearchableDropdown from './SpaSearchableDropdown';

interface JobFormStep1Props {
  formData: any;
  onFieldChange: (name: string, value: any) => void;
  spas: Spa[];
  jobTypes: JobType[];
  jobCategories: JobCategory[];
  userRole?: string;
  errors?: Record<string, string>;
}

export default function JobFormStep1({
  formData,
  onFieldChange,
  spas,
  jobTypes,
  jobCategories,
  userRole,
  errors = {},
}: JobFormStep1Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onFieldChange(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-600 mt-1">Provide essential details about the job position</p>
      </div>

      {/* SPA Selection */}
      <div>
        <label htmlFor="spa_id" className="block text-sm font-semibold text-gray-700 mb-2">
          Select SPA <span className="text-red-500">*</span>
        </label>
        <SpaSearchableDropdown
          spas={spas}
          value={formData.spa_id}
          onChange={(spaId) => onFieldChange('spa_id', spaId)}
          disabled={userRole === 'recruiter'}
          required
          error={errors.spa_id}
        />
        {userRole === 'recruiter' && (
          <p className="mt-1 text-xs text-gray-500">This job will be posted for your business</p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-3 border ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          required
          placeholder="e.g., Senior Spa Therapist"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{typeof errors.title === 'string' ? errors.title : String(errors.title)}</p>}
      </div>

      {/* Job Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-4 py-3 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none`}
          required
          placeholder="Provide a detailed description of the job role, what you're looking for, and what makes this opportunity special..."
        ></textarea>
        {errors.description && <p className="mt-1 text-sm text-red-600">{typeof errors.description === 'string' ? errors.description : String(errors.description)}</p>}
      </div>

      {/* Requirements */}
      <div>
        <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 mb-2">
          Requirements
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={4}
          value={formData.requirements}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          placeholder="Required qualifications, certifications, skills, and experience..."
        ></textarea>
      </div>

      {/* Responsibilities */}
      <div>
        <label htmlFor="responsibilities" className="block text-sm font-semibold text-gray-700 mb-2">
          Responsibilities
        </label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={4}
          value={formData.responsibilities}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          placeholder="Key responsibilities and daily tasks for this position..."
        ></textarea>
      </div>

      {/* Benefits */}
      <div>
        <label htmlFor="benefits" className="block text-sm font-semibold text-gray-700 mb-2">
          Benefits
        </label>
        <textarea
          id="benefits"
          name="benefits"
          rows={3}
          value={formData.benefits}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          placeholder="Benefits offered (e.g., Health Insurance, Paid Leave, Bonus, Incentives, etc.)"
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">Describe the benefits and perks offered for this position</p>
      </div>

      {/* Job Timing */}
      <div>
        <label htmlFor="job_timing" className="block text-sm font-semibold text-gray-700 mb-2">
          Job Timing
        </label>
        <select
          id="job_timing"
          name="job_timing"
          value={formData.job_timing}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        >
          <option value="">Select Job Timing</option>
          <option value="11:00 AM to 8:00 PM">11:00 AM to 8:00 PM</option>
          <option value="11:00 AM to 10:00 PM">11:00 AM to 10:00 PM</option>
          <option value="11:00 AM to 11:00 PM">11:00 AM to 11:00 PM</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Select the working hours for this position</p>
      </div>

      {/* Key Skills */}
      <div>
        <label htmlFor="key_skills" className="block text-sm font-semibold text-gray-700 mb-2">
          Key Skills
        </label>
        <textarea
          id="key_skills"
          name="key_skills"
          rows={3}
          value={formData.key_skills}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          placeholder="Essential skills required (e.g., Customer Service, Massage Therapy, Product Knowledge)"
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">Separate skills with commas or list one per line</p>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Job Type */}
        <div>
          <label htmlFor="job_type_id" className="block text-sm font-semibold text-gray-700 mb-2">
            Job Type
          </label>
          <select
            id="job_type_id"
            name="job_type_id"
            value={formData.job_type_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="">Select Type</option>
            {jobTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Job Category */}
        <div>
          <label htmlFor="job_category_id" className="block text-sm font-semibold text-gray-700 mb-2">
            Job Category
          </label>
          <select
            id="job_category_id"
            name="job_category_id"
            value={formData.job_category_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="">Select Category</option>
            {jobCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Industry Type */}
        <div>
          <label htmlFor="Industry_type" className="block text-sm font-semibold text-gray-700 mb-2">
            Industry Type
          </label>
          <input
            type="text"
            id="Industry_type"
            name="Industry_type"
            value={formData.Industry_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Beauty and Spa"
          />
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="Employee_type" className="block text-sm font-semibold text-gray-700 mb-2">
            Employment Type
          </label>
          <select
            id="Employee_type"
            name="Employee_type"
            value={formData.Employee_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        {/* Required Gender */}
        <div>
          <label htmlFor="required_gender" className="block text-sm font-semibold text-gray-700 mb-2">
            Required Gender
          </label>
          <select
            id="required_gender"
            name="required_gender"
            value={formData.required_gender}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Any">Any</option>
          </select>
        </div>
      </div>

      {/* Number of Openings */}
      <div>
        <label htmlFor="job_opening_count" className="block text-sm font-semibold text-gray-700 mb-2">
          Number of Openings
        </label>
        <input
          type="number"
          id="job_opening_count"
          name="job_opening_count"
          value={formData.job_opening_count}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="1"
          min="1"
        />
        <p className="mt-1 text-xs text-gray-500">How many positions are you hiring for?</p>
      </div>
    </div>
  );
}

