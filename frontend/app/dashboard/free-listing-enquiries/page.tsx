'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  enquiryFreeListAPI,
  FreeListingEnquiry,
  FreeListingStats,
  FreeListingStatus,
} from '@/lib/enquiryFreeList';

const statusLabels: Record<FreeListingStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  verified: 'Verified',
  credentials_sent: 'Credentials Sent',
  closed: 'Closed',
};

const statusClasses: Record<FreeListingStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-amber-100 text-amber-800',
  verified: 'bg-green-100 text-green-800',
  credentials_sent: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function FreeListingEnquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<FreeListingEnquiry[]>([]);
  const [stats, setStats] = useState<FreeListingStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<FreeListingStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'manager') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, authLoading, router, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [enquiryData, statsData] = await Promise.all([
        enquiryFreeListAPI.getAll({
          limit: 200,
          status_filter: statusFilter || undefined,
        }),
        enquiryFreeListAPI.getStats(),
      ]);

      setEnquiries(enquiryData);
      setStats(statsData);
      setDraftNotes(
        enquiryData.reduce<Record<number, string>>((acc, enquiry) => {
          acc[enquiry.id] = enquiry.followup_notes || '';
          return acc;
        }, {})
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load free listing enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const saveFollowup = async (enquiry: FreeListingEnquiry, status?: FreeListingStatus) => {
    setSavingId(enquiry.id);
    setError(null);

    try {
      await enquiryFreeListAPI.updateFollowup(enquiry.id, {
        status,
        followup_notes: draftNotes[enquiry.id] || '',
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save follow-up.');
    } finally {
      setSavingId(null);
    }
  };

  const verifyEnquiry = async (enquiry: FreeListingEnquiry) => {
    setSavingId(enquiry.id);
    setError(null);

    try {
      await enquiryFreeListAPI.verify(enquiry.id, {
        is_verified: true,
        followup_notes: draftNotes[enquiry.id] || enquiry.followup_notes || '',
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify enquiry.');
    } finally {
      setSavingId(null);
    }
  };

  const markCredentialsSent = async (enquiry: FreeListingEnquiry) => {
    setSavingId(enquiry.id);
    setError(null);

    try {
      await enquiryFreeListAPI.markCredentialsSent(enquiry.id, {
        credential_email: enquiry.email,
        credential_notes: draftNotes[enquiry.id] || 'Credentials shared after verification.',
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verify this enquiry before sending credentials.');
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="dashboard-surface">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-surface">
      <Navbar />
      <main className="page-shell py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="section-heading">Free Listing Enquiries</h1>
            <p className="section-subheading">Follow up, verify businesses, and record credentials sent.</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ['Total', stats.total],
              ['New', stats.new],
              ['Contacted', stats.contacted],
              ['Verified', stats.verified],
              ['Credentials', stats.credentials_sent],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Filter by status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FreeListingStatus | '')}
            className="input-field max-w-xs bg-white"
          >
            <option value="">All enquiries</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
              No free listing enquiries found.
            </div>
          ) : (
            enquiries.map((enquiry) => (
              <div key={enquiry.id} className="card">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{enquiry.business_name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[enquiry.status]}`}>
                        {statusLabels[enquiry.status]}
                      </span>
                      {enquiry.is_verified && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                      <p><span className="font-semibold">Contact:</span> {enquiry.contact_name}</p>
                      <p><span className="font-semibold">Phone:</span> {enquiry.phone}</p>
                      <p><span className="font-semibold">Email:</span> {enquiry.email}</p>
                      <p><span className="font-semibold">Type:</span> {enquiry.business_type.replace('_', ' ')}</p>
                      {enquiry.city && <p><span className="font-semibold">City:</span> {enquiry.city}</p>}
                      {enquiry.website && <p><span className="font-semibold">Website:</span> {enquiry.website}</p>}
                    </div>

                    {enquiry.address && <p className="mt-3 text-sm text-gray-700">{enquiry.address}</p>}
                    {enquiry.message && <p className="mt-3 text-sm text-gray-600">{enquiry.message}</p>}

                    <textarea
                      value={draftNotes[enquiry.id] || ''}
                      onChange={(event) =>
                        setDraftNotes((prev) => ({ ...prev, [enquiry.id]: event.target.value }))
                      }
                      className="input-field mt-4"
                      rows={3}
                      placeholder="Follow-up notes, call summary, credential details..."
                    />
                  </div>

                  <div className="flex min-w-52 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => saveFollowup(enquiry, 'contacted')}
                      disabled={savingId === enquiry.id}
                      className="btn-secondary disabled:opacity-60"
                    >
                      Save Follow-up
                    </button>
                    <button
                      type="button"
                      onClick={() => verifyEnquiry(enquiry)}
                      disabled={savingId === enquiry.id || enquiry.is_verified}
                      className="btn-primary disabled:opacity-60"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => markCredentialsSent(enquiry)}
                      disabled={savingId === enquiry.id || !enquiry.is_verified}
                      className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
                    >
                      Credentials Sent
                    </button>
                    <button
                      type="button"
                      onClick={() => saveFollowup(enquiry, 'closed')}
                      disabled={savingId === enquiry.id}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
