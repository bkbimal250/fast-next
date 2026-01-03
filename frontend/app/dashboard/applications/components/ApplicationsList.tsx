'use client';

import { Application } from '@/lib/application';
import ApplicationCard from './ApplicationCard';
import { useMemo } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import Pagination from '@/components/Pagination';
import SearchableSelect from '../../spas/components/SearchableSelect';

interface ApplicationsListProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  onStatusChange?: (id: number, status: string) => void;
  onDelete?: (id: number) => void;
  filters: {
    status: string;
    search: string;
    stateId: number | null;
    cityId: number | null;
    areaId: number | null;
    jobTypeId: number | null;
    jobCategoryId: number | null;
  };
  onFiltersChange: (filters: any) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  states: any[];
  cities: any[];
  areas: any[];
  jobTypes: any[];
  jobCategories: any[];
  loadingLocations: boolean;
}

export default function ApplicationsList({
  applications,
  onViewDetails,
  onStatusChange,
  onDelete,
  filters,
  onFiltersChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  states,
  cities,
  areas,
  jobTypes,
  jobCategories,
  loadingLocations,
}: ApplicationsListProps) {
  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app) => {
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

      // State filter (based on job location)
      if (filters.stateId && app.job?.state_id !== filters.stateId) {
        return false;
      }

      // City filter (based on job location)
      if (filters.cityId && app.job?.city_id !== filters.cityId) {
        return false;
      }

      // Area filter (based on job location)
      if (filters.areaId && app.job?.area_id !== filters.areaId) {
        return false;
      }

      // Job Type filter
      if (filters.jobTypeId && app.job?.job_type_id !== filters.jobTypeId) {
        return false;
      }

      // Job Category filter
      if (filters.jobCategoryId && app.job?.job_category_id !== filters.jobCategoryId) {
        return false;
      }

      return true;
    });

    // Sort by created_at descending (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="Search by name, email, phone, job title, or location..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Job Type Filter */}
          <SearchableSelect
            options={jobTypes.map((type) => ({ id: type.id, name: type.name }))}
            value={filters.jobTypeId}
            onChange={(id) => onFiltersChange({ ...filters, jobTypeId: id })}
            placeholder="All Job Types"
            disabled={jobTypes.length === 0}
          />

          {/* Job Category Filter */}
          <SearchableSelect
            options={jobCategories.map((cat) => ({ id: cat.id, name: cat.name }))}
            value={filters.jobCategoryId}
            onChange={(id) => onFiltersChange({ ...filters, jobCategoryId: id })}
            placeholder="All Categories"
            disabled={jobCategories.length === 0}
          />

          {/* State Filter */}
          <SearchableSelect
            options={states.map((state) => ({ id: state.id, name: state.name }))}
            value={filters.stateId}
            onChange={(id) => onFiltersChange({ ...filters, stateId: id, cityId: null, areaId: null })}
            placeholder="All States"
            disabled={loadingLocations}
          />

          {/* City Filter */}
          <SearchableSelect
            options={cities
              .filter((city) => !filters.stateId || city.state_id === filters.stateId)
              .map((city) => ({ id: city.id, name: city.name }))}
            value={filters.cityId}
            onChange={(id) => onFiltersChange({ ...filters, cityId: id, areaId: null })}
            placeholder="All Cities"
            disabled={loadingLocations}
          />

          {/* Area Filter */}
          <SearchableSelect
            options={areas
              .filter((area) => !filters.cityId || area.city_id === filters.cityId)
              .map((area) => ({ id: area.id, name: area.name }))}
            value={filters.areaId}
            onChange={(id) => onFiltersChange({ ...filters, areaId: id })}
            placeholder="All Areas"
            disabled={loadingLocations || !filters.cityId}
          />
        </div>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredApplications.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{applications.length}</span> applications
          {filteredApplications.length !== applications.length && (
            <span className="ml-2">
              ({paginatedApplications.length} on this page)
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
                onDelete={onDelete}
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

