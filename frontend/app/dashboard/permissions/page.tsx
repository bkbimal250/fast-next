'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PermissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600 mt-2">Manage user permissions (Admin only)</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Coming Soon</h3>
            <p className="text-yellow-700">
              Permissions management interface will be available here. This will allow you to:
            </p>
            <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
              <li>View and manage user permissions</li>
              <li>Assign roles and capabilities</li>
              <li>Control access to features</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Role Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Admin</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Full system access</li>
                    <li>✓ User management</li>
                    <li>✓ SPA management</li>
                    <li>✓ Job management</li>
                    <li>✓ Location management</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Manager</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ SPA management</li>
                    <li>✓ Job management</li>
                    <li>✓ Location management</li>
                    <li>✗ User management</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Recruiter</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Job management (own business)</li>
                    <li>✓ View applications</li>
                    <li>✗ SPA management</li>
                    <li>✗ User management</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">User</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ View jobs</li>
                    <li>✓ Apply to jobs</li>
                    <li>✓ Manage profile</li>
                    <li>✗ Create jobs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

