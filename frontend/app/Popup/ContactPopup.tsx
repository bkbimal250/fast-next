'use client';

import { useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { contactAPI, ContactSubject } from '@/lib/contact';

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactPopup({ open, onClose }: ContactPopupProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    subject: ContactSubject.OTHERS,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await contactAPI.submitContact({
        name: formData.name,
        phone: formData.phone,
        message: formData.message || undefined,
        subject: formData.subject,
      });

      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        message: '',
        subject: ContactSubject.OTHERS,
      });

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">
          Send us a Message
        </h2>

        {success && (
          <div className="mb-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <FaCheckCircle className="text-green-600 mt-0.5" />
            <p className="text-sm text-green-700">
              Message sent successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <FaExclamationCircle className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name *"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          />

          <input
            type="tel"
            placeholder="Phone *"
            required
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // digits only
              if (value.length <= 10) {
                setFormData({ ...formData, phone: value });
              }
            }}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          />


          <select
            value={formData.subject}
            onChange={(e) =>
              setFormData({
                ...formData,
                subject: e.target.value as ContactSubject,
              })
            }
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          >
            <option value={ContactSubject.JOBS}>Jobs</option>
            <option value={ContactSubject.JOBS_LISTING}>Jobs Listing</option>
            <option value={ContactSubject.OTHERS}>Others</option>
          </select>

          <textarea
            rows={4}
            placeholder="Message (optional)"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          />

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-lg border py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 rounded-lg bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
