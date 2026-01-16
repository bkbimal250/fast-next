'use client';

import { useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from 'react-icons/fa';
import { contactAPI, ContactSubject } from '@/lib/contact';

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;
}

interface ContactFormState {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPopup({ open, onClose }: ContactPopupProps) {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const updateField = (key: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await contactAPI.submitContact({
        name: form.name,
        phone: form.phone,
        subject: form.subject as ContactSubject,
        message: form.message || undefined,
      });

      setSuccess(true);
      setForm({ name: '', phone: '', subject: '', message: '' });

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      let message = 'Failed to send message. Please try again.';

      const detail = err?.response?.data?.detail;
      if (detail) {
        if (Array.isArray(detail)) {
          message = detail
            .map((e: any) => `${e.loc?.join('.')}: ${e.msg}`)
            .join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        } else {
          message = 'Validation error. Please check your input.';
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="mb-4 pr-8 text-xl font-bold text-gray-900">
          Send us a Message, Verified Spa Jobs
        </h2>

        {success && (
          <div className="mb-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <FaCheckCircle className="mt-0.5 text-green-600" />
            <p className="text-sm text-green-700">
              Message sent successfully! Our team will get back to you soon.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <FaExclamationCircle className="mt-0.5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Name *"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          />

          <input
            type="tel"
            required
            placeholder="Phone *"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) updateField('phone', value);
            }}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          />

          <select
            value={form.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Select Job Category</option>
            <option value={ContactSubject.Therapist}>
              Female Therapist jobs
            </option>
            <option value={ContactSubject.spaTherapist}>
              Thai Therapist jobs
            </option>
            <option value={ContactSubject.manager}>
              Male Spa Manager jobs
            </option>
            <option value={ContactSubject.receptionist}>
              Female Receptionist jobs
            </option>
            <option value={ContactSubject.housekeeping}>
              Male Housekeeping jobs
            </option>
          </select>

          <textarea
            rows={4}
            placeholder="Enter job location (optional)"
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
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
