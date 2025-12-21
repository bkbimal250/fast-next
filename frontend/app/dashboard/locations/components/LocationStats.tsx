'use client';

import { FaGlobe, FaMapMarkerAlt, FaCity, FaBuilding, FaBriefcase } from 'react-icons/fa';

interface LocationStatsProps {
  stats: {
    totalCountries: number;
    totalStates: number;
    totalCities: number;
    totalAreas: number;
    totalJobs: number;
  };
}

export default function LocationStats({ stats }: LocationStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-5">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Countries</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCountries}</p>
          </div>
          <div className="bg-brand-100 rounded-lg p-2.5">
            <div className="text-brand-600">
              <FaGlobe size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">States</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalStates}</p>
          </div>
          <div className="bg-brand-100 rounded-lg p-2.5">
            <div className="text-brand-600">
              <FaMapMarkerAlt size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Cities</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCities}</p>
          </div>
          <div className="bg-brand-100 rounded-lg p-2.5">
            <div className="text-brand-600">
              <FaCity size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Areas</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalAreas}</p>
          </div>
          <div className="bg-brand-100 rounded-lg p-2.5">
            <div className="text-brand-600">
              <FaBuilding size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Jobs</p>
            <p className="text-xl sm:text-2xl font-bold text-gold-600">{stats.totalJobs}</p>
          </div>
          <div className="bg-gold-100 rounded-lg p-2.5">
            <div className="text-gold-600">
              <FaBriefcase size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

