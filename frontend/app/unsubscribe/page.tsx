'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { subscribeAPI } from '@/lib/subscribe';
import Navbar from '@/components/Navbar';
import { FaCheckCircle, FaTimesCircle, FaEnvelope } from 'react-icons/fa';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Invalid unsubscribe link. No token provided.');
      setLoading(false);
      return;
    }

    const unsubscribe = async () => {
      try {
        const result = await subscribeAPI.unsubscribe(token);
        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.message || 'Failed to unsubscribe');
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to unsubscribe. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing unsubscribe request...</p>
            </>
          ) : success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-green-600">
                  <FaCheckCircle size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Unsubscribed</h1>
              <p className="text-gray-600 mb-6">
                You have been successfully unsubscribed from job notifications.
              </p>
              <p className="text-sm text-gray-500">
                You can subscribe again anytime from the jobs page.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-red-600">
                  <FaTimesCircle size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe Failed</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-sm text-gray-500">
                If you continue to receive emails, please contact support.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-light">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}

