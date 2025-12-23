'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-600 mb-2">Workspa</h1>
            <p className="text-lg text-gray-600">Create a new account</p>
          </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="accept-terms" className="ml-2 text-xs text-gray-600">
                By clicking Sign Up, you agree to our{' '}
                <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms
                </Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-semibold text-base"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

