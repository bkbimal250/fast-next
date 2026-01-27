'use client';

import { Spa } from '@/lib/spa';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaAddressCard } from 'react-icons/fa';

interface SpaContactCardProps {
  spa: Spa;
}

export default function SpaContactCard({ spa }: SpaContactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 sticky top-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="text-brand-600">
          <FaAddressCard size={16} />
        </div>
        Contact Information
      </h3>
      <div className="space-y-4">
        {(spa.address || spa.postalCode) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600 mt-0.5">
              <FaMapMarkerAlt size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium">Address</p>
              {spa.address && <p className="text-sm text-gray-900 leading-relaxed">{spa.address}</p>}
              {spa.postalCode && (
                <p className="text-sm text-gray-900 font-medium mt-1">Postal Code: {spa.postalCode}</p>
              )}
            </div>
          </div>
        )}
        {/* {spa.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
              <FaPhone size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium">Phone</p>
              <a href={`tel:${spa.phone}`} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">
                {spa.phone}
              </a>
            </div>
          </div>
        )} */}
        {spa.email && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
              <FaEnvelope size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium">Email</p>
              <a href={`mailto:${spa.email}`} className="text-sm text-brand-600 hover:text-brand-700 font-semibold break-all">
                {spa.email}
              </a>
            </div>
          </div>
        )}
        {spa.website && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
              <FaGlobe size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1 font-medium">Website</p>
              <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700 font-semibold break-all">
                {spa.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

