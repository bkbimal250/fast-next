'use client';

import Link from 'next/link';
import { Country, State, City, Area } from '@/lib/location';
import { FaGlobe, FaMapMarkerAlt, FaCity, FaBuilding, FaBriefcase, FaEdit, FaTrash } from 'react-icons/fa';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationRowProps {
  type: LocationType;
  location: Country | State | City | Area;
  jobCount?: number;
  loadingCount?: boolean;
  userRole: string;
  onDelete: (id: number, name: string) => void;
}

const getLocationIcon = (type: LocationType) => {
  switch (type) {
    case 'countries':
      return FaGlobe;
    case 'states':
      return FaMapMarkerAlt;
    case 'cities':
      return FaCity;
    case 'areas':
      return FaBuilding;
  }
};

export default function LocationRow({
  type,
  location,
  jobCount,
  loadingCount,
  userRole,
  onDelete,
}: LocationRowProps) {
  const Icon = getLocationIcon(type);

  const getJobCountLink = () => {
    if (loadingCount) {
      return <div className="animate-pulse h-4 w-8 bg-gray-200 rounded"></div>;
    }

    const count = jobCount || 0;
    let href = '/jobs';

    if (type === 'countries') {
      href = `/jobs?country_id=${location.id}`;
    } else if (type === 'states') {
      href = `/jobs?state_id=${location.id}`;
    } else if (type === 'cities') {
      const city = location as City;
      href = `/cities/${city.slug || city.name.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (type === 'areas') {
      href = `/jobs?area_id=${location.id}`;
    }

    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-50 text-gold-700 rounded-lg text-xs font-semibold hover:bg-gold-100 transition-colors"
      >
        <div>
          <FaBriefcase size={12} />
        </div>
        {count} jobs
      </Link>
    );
  };

  const getLocationName = () => {
    if (type === 'cities') {
      const city = location as City;
      return (
        <Link
          href={`/cities/${city.slug || city.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors"
        >
          {city.name}
        </Link>
      );
    }
    return <span className="text-sm font-medium text-gray-900">{location.name}</span>;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">#{location.id}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="text-brand-600 flex-shrink-0">
            <Icon size={16} />
          </div>
          {getLocationName()}
        </div>
      </td>
      {type === 'states' && (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-600">
            {(location as State).country?.name || <span className="text-gray-400 italic">N/A</span>}
          </span>
        </td>
      )}
      {type === 'cities' && (
        <>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-600">
              {(location as City).state?.name || <span className="text-gray-400 italic">N/A</span>}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-600">
              {(location as City).country?.name || <span className="text-gray-400 italic">N/A</span>}
            </span>
          </td>
        </>
      )}
      {type === 'areas' && (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-600">
            {(location as Area).city?.name || <span className="text-gray-400 italic">N/A</span>}
          </span>
        </td>
      )}
      {(type === 'cities' || type === 'areas' || type === 'states' || type === 'countries') && (
        <td className="px-6 py-4 whitespace-nowrap">{getJobCountLink()}</td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/dashboard/locations/${type}/${location.id}/edit`}
            className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit size={16} />
          </Link>
          {userRole === 'admin' && (
            <button
              onClick={() => onDelete(location.id, location.name)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

