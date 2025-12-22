'use client';

import { useState } from 'react';
import { subscribeAPI, SubscriptionCreate, SubscriptionFrequency } from '@/lib/subscribe';
import { useAuth } from '@/contexts/AuthContext';
import { FaEnvelope, FaCheckCircle, FaBell } from 'react-icons/fa';

interface SubscribeFormProps {
  onSuccess?: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export default function SubscribeForm({
  onSuccess,
  defaultEmail,
  defaultName,
}: SubscribeFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SubscriptionCreate>({
    email: defaultEmail || user?.email || '',
    name: defaultName || user?.name || '',
    frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await subscribeAPI.subscribe(formData);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        if (!user) {
          setFormData({
            email: '',
            name: '',
            frequency: 'daily',
          });
        }
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <FaCheckCircle className="text-green-600" />
          <p className="font-semibold">Successfully subscribed!</p>
        </div>
        <p className="text-sm text-green-600 mt-1">
          You'll receive job notifications based on your preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaBell className="text-brand-600" />
          Subscribe to Job Notifications
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Get notified about new job opportunities that match your preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!user && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Notification Frequency *
          </label>
          <select
            id="frequency"
            required
            className="input-field"
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value as SubscriptionFrequency })
            }
          >
            <option value="daily">Daily Digest</option>
            <option value="weekly">Weekly Digest</option>
            <option value="monthly">Monthly Digest</option>
            <option value="instant">Instant (as soon as jobs are posted)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose how often you want to receive job notifications
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <FaBell />
              <span>Subscribe to Notifications</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          You can unsubscribe at any time from the email notifications.
        </p>
      </form>
    </div>
  );
}

