'use client';

import { Country, State, City, Area } from '@/lib/location';
import LocationRow from './LocationRow';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationsTableProps {
  activeTab: LocationType;
  locations: (Country | State | City | Area)[];
  jobCounts: { [key: number]: number };
  loadingCounts: boolean;
  userRole: string;
  onDelete: (type: LocationType, id: number) => void;
}

export default function LocationsTable({
  activeTab,
  locations,
  jobCounts,
  loadingCounts,
  userRole,
  onDelete,
}: LocationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      {locations.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">No {activeTab} found</p>
          <p className="text-sm text-gray-500">Get started by creating a new {activeTab.slice(0, -1)}</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              {activeTab === 'states' && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Country
                </th>
              )}
              {activeTab === 'cities' && (
                <>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Country
                  </th>
                </>
              )}
              {activeTab === 'areas' && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  City
                </th>
              )}
              {(activeTab === 'cities' || activeTab === 'areas' || activeTab === 'states' || activeTab === 'countries') && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Jobs
                </th>
              )}
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location, index) => (
              <LocationRow
                key={location.id}
                type={activeTab}
                location={location}
                jobCount={jobCounts[location.id]}
                loadingCount={loadingCounts}
                userRole={userRole}
                onDelete={(id) => onDelete(activeTab, id)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

