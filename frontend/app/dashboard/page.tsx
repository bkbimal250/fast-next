'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserDashboard from '@/components/dashboards/UserDashboard';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import RecruiterDashboard from '@/components/dashboards/RecruiterDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'recruiter':
      return <RecruiterDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
}

