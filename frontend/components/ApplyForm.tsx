'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

interface ApplyFormProps {
  jobSlug: string;
  jobId?: number;
}

export default function ApplyForm({ jobSlug, jobId }: ApplyFormProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    experience: '',
    location: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('job_id', jobId?.toString() || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      if (formData.experience) formDataToSend.append('experience', formData.experience);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (cvFile) formDataToSend.append('cv_file', cvFile);

      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await axios.post(`${API_URL}/api/applications/`, formDataToSend, { headers });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Application submitted successfully!</p>
        <p className="text-sm mt-1">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          required
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={!!user}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          required
          className="input-field"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={!!user}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          required
          className="input-field"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={!!user}
        />
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
          Experience (Years)
        </label>
        <input
          id="experience"
          type="text"
          className="input-field"
          placeholder="e.g., 2 years"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Current Location
        </label>
        <input
          id="location"
          type="text"
          className="input-field"
          placeholder="City, State"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Resume/CV
        </label>
        <input
          id="cv"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif,image/webp"
          className="input-field"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP (Max 10MB)</p>
        {user?.resume_path && (
          <p className="text-sm text-green-600 mt-1">✓ Using your saved resume</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>

      {!user && (
        <p className="text-xs text-center text-gray-500">
          <a href="/register" className="text-blue-600 hover:underline">
            Create an account
          </a>{' '}
          to save your information for future applications
        </p>
      )}
    </form>
  );
}
