'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthAlert, AuthPageShell, PasswordField } from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';

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

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
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
    <AuthPageShell
      title="Create your account"
      subtitle="Apply for jobs, manage your profile, or start your employer free-listing journey."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert type="error">{error}</AuthAlert>}

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="input-field"
            placeholder="Your full name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              className="input-field"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </div>
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={formData.password}
          onChange={(value) => updateField('password', value)}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" target="_blank" className="font-semibold text-brand-700 hover:text-brand-800">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="font-semibold text-brand-700 hover:text-brand-800">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button type="submit" disabled={loading || !acceptedTerms} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </AuthPageShell>
  );
}
