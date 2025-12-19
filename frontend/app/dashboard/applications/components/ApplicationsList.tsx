'use client';

import { Application } from '@/lib/application';
import ApplicationCard from './ApplicationCard';
import ApplicationFilters from './ApplicationFilters';
import { useState, useMemo } from 'react';

interface ApplicationsListProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  onStatusChange?: (id: number, status: string) => void;
}

export default function ApplicationsList({
  applications,
  onViewDetails,
  onStatusChange,
}: ApplicationsListProps) {
  const [filters, setFilters] = useState({ status: '', search: '' });

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (filters.status && app.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          app.name.toLowerCase().includes(searchLower) ||
          app.email.toLowerCase().includes(searchLower) ||
          app.phone?.toLowerCase().includes(searchLower) ||
          app.job?.title.toLowerCase().includes(searchLower) ||
          app.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [applications, filters]);

  return (
    <div>
      {/* Filters */}
      <ApplicationFilters filters={filters} onFilterChange={setFilters} />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Total Applications</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {applications.filter((a) => a.status.toLowerCase() === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Accepted</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {applications.filter((a) => a.status.toLowerCase() === 'accepted').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {applications.filter((a) => a.status.toLowerCase() === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status
              ? 'Try adjusting your filters'
              : 'No applications have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onViewDetails={onViewDetails}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

