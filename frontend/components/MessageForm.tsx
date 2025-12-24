/**
 * Message form component for sending free messages about jobs
 */

'use client'

import { useState } from 'react';
import { messageAPI, MessageCreate } from '@/lib/message';
import { FaEnvelope, FaUser, FaPhone, FaComment } from 'react-icons/fa';

interface MessageFormProps {
  jobId: number;
  jobTitle?: string;
  onSuccess?: () => void;
}

export default function MessageForm({ jobId, jobTitle, onSuccess }: MessageFormProps) {
  const [formData, setFormData] = useState<MessageCreate>({
    job_id: jobId,
    sender_name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare data: convert empty email to null/undefined
      const dataToSend = {
        ...formData,
        email: formData.email?.trim() || undefined,
      };
      
      await messageAPI.createMessage(dataToSend);
      setSuccess(true);
      setFormData({
        job_id: jobId,
        sender_name: '',
        phone: '',
        email: '',
        message: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      // Handle validation errors properly
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle Pydantic validation errors
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Multiple validation errors
            const errors = errorData.detail.map((e: any) => {
              const field = e.loc?.join('.') || 'field';
              return `${field}: ${e.msg}`;
            });
            errorMessage = errors.join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = 'Validation error. Please check your input.';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <div className="text-green-600">
            <FaEnvelope />
          </div>
          <p className="font-semibold">Message sent successfully!</p>
        </div>
        <p className="text-sm text-green-600 mt-1">
          Your inquiry has been sent. We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaEnvelope className="text-brand-600" size={20} />
          Send a Free Message
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Have a question about this job? Send a message without creating an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" size={16} />
            </div>
            <input
              id="sender_name"
              type="text"
              required
              className="input-field pl-10"
              placeholder="Enter your full name"
              value={formData.sender_name}
              onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" size={16} />
            </div>
            <input
              id="phone"
              type="tel"
              required
              className="input-field pl-10"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" size={16} />
            </div>
            <input
              id="email"
              type="email"
              className="input-field pl-10"
              placeholder="Enter your email (optional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Your Message *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FaComment className="text-gray-400" size={16} />
            </div>
            <textarea
              id="message"
              required
              rows={4}
              className="input-field pl-10 pt-3"
              placeholder="Ask about the job, working hours, salary details, or any other questions..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FaEnvelope />
              <span>Send Message</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          No account required. Your message will be reviewed by the admin/manager.
        </p>
      </form>
    </div>
  );
}

