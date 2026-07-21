'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthAlert, AuthPageShell, PasswordField } from '@/components/auth';
import { authAPI } from '@/lib/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!token) {
      setError('Reset token is required.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token.trim(), password);
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Choose a new password"
      subtitle="Create a secure password for your Workspa account."
      footer={
        <>
          Know your password?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert type="error">{error}</AuthAlert>}
        {message && <AuthAlert type="success">{message}</AuthAlert>}

        {!searchParams.get('token') && (
          <div>
            <label htmlFor="token" className="mb-2 block text-sm font-semibold text-gray-700">
              Reset token
            </label>
            <input
              id="token"
              type="text"
              required
              className="input-field"
              placeholder="Paste reset token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
        )}

        <PasswordField
          id="password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="dashboard-surface flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
