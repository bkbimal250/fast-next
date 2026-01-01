'use client';

import { Application } from '@/lib/application';
import ApplicationCard from './ApplicationCard';
import ApplicationFilters from './ApplicationFilters';
import { useState, useMemo } from 'react';
import { FaFileAlt, FaSearch } from 'react-icons/fa';
import Pagination from '@/components/Pagination';

interface ApplicationsListProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  onStatusChange?: (id: number, status: string) => void;
  filters: { status: string; search: string };
  onFiltersChange: (filters: { status: string; search: string }) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export default function ApplicationsList({
  applications,
  onViewDetails,
  onStatusChange,
  filters,
  onFiltersChange,
  currentPage,
  onPageChange,
  itemsPerPage,
}: ApplicationsListProps) {
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
          app.job?.title?.toLowerCase().includes(searchLower) ||
          app.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [applications, filters]);

  // Paginate filtered applications
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                <FaSearch size={16} />
              </div>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="Search by name, email, phone, or job title..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs sm:text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{paginatedApplications.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{filteredApplications.length}</span> applications
          {paginatedApplications.length !== filteredApplications.length && (
            <span className="ml-2">
              (Page {currentPage} of {Math.ceil(filteredApplications.length / itemsPerPage)})
            </span>
          )}
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FaFileAlt size={48} />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status
              ? 'Try adjusting your filters'
              : 'No applications have been submitted yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {paginatedApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewDetails={onViewDetails}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {filteredApplications.length > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredApplications.length}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

