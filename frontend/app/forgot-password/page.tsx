'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AuthAlert, AuthPageShell } from '@/components/auth';
import { authAPI } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim());
      setMessage(response.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Reset your password"
      subtitle="Enter your account email and we will send instructions to reset your password."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert type="error">{error}</AuthAlert>}
        {message && <AuthAlert type="success">{message}</AuthAlert>}

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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthPageShell>
  );
}
