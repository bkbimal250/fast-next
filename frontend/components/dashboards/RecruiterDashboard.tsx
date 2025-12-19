'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { spaAPI } from '@/lib/spa';
import { jobAPI } from '@/lib/job';
import { applicationAPI } from '@/lib/application';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    spaCount: 0,
    jobCount: 0,
    applicationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mySpa, myJobs, myApplications] = await Promise.all([
          spaAPI.getMySpa().catch(() => null),
          jobAPI.getMyJobs().catch(() => []),
          applicationAPI.getMyApplications().catch(() => []),
        ]);
        
        setStats({
          spaCount: mySpa ? 1 : 0,
          jobCount: myJobs?.length || 0,
          applicationCount: myApplications?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const statCards = [
    {
      title: 'My Business',
      value: stats.spaCount,
      subtitle: stats.spaCount > 0 ? 'SPA Created' : 'No SPA Yet',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      link: '/dashboard/business',
    },
    {
      title: 'Active Jobs',
      value: stats.jobCount,
      subtitle: 'Posted Jobs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      link: '/dashboard/jobs',
    },
    {
      title: 'Applications',
      value: stats.applicationCount,
      subtitle: 'Total Received',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      link: '/dashboard/applications',
    },
  ];

  const actionCards = [
    {
      title: 'Manage Business',
      description: 'View and edit your SPA/business details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      link: '/dashboard/business',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Post New Job',
      description: 'Create a new job posting for your SPA',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: '/dashboard/jobs/create',
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
    },
    {
      title: 'View Applications',
      description: 'See all applications for your job postings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/dashboard/applications',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {user?.name}! Manage your business and grow your team.</p>
            </div>
            <Link href="/profile" className="btn-primary self-start sm:self-auto shadow-md hover:shadow-lg transition-shadow">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.link}
              className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`${stat.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">{stat.icon}</div>
                  <span className="text-3xl font-bold">{loading ? '...' : stat.value}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
                <p className="text-white/80 text-sm">{stat.subtitle}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionCards.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className={`${action.color} p-6 rounded-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-current`}
              >
                <div className="mb-4">{action.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-75">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Post Job Card */}
          <Link
            href="/dashboard/jobs/create"
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Post a New Job</h3>
                <p className="text-white/90">Create a job listing for your business</p>
              </div>
            </div>
            <div className="flex items-center text-white/80 font-medium">
              Get started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* View Jobs Card */}
          <Link
            href="/dashboard/jobs"
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">View My Jobs</h3>
                <p className="text-white/90">Manage your job postings</p>
              </div>
            </div>
            <div className="flex items-center text-white/80 font-medium">
              View all jobs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-lg mb-2">Recruiter Information</h4>
              <p className="text-blue-800 leading-relaxed">
                As a recruiter, you can manage one business (SPA) and create multiple job postings for it. 
                You can view and manage all applications received for jobs posted on your business. 
                Managers and Admins can post jobs on SPAs they created, not on yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
