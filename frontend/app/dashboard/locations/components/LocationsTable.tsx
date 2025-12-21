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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            {activeTab === 'states' && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Country
              </th>
            )}
            {activeTab === 'cities' && (
              <>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Country
                </th>
              </>
            )}
            {activeTab === 'areas' && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                City
              </th>
            )}
            {(activeTab === 'cities' || activeTab === 'areas' || activeTab === 'states' || activeTab === 'countries') && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Jobs
              </th>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {locations.map((location) => (
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
      {locations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No {activeTab} found</p>
        </div>
      )}
    </div>
  );
}

