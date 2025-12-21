'use client';

import { FaGlobe, FaMapMarkerAlt, FaCity, FaBuilding } from 'react-icons/fa';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationTabsProps {
  activeTab: LocationType;
  onTabChange: (tab: LocationType) => void;
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

export default function LocationTabs({ activeTab, onTabChange }: LocationTabsProps) {
  const tabs: LocationType[] = ['countries', 'states', 'cities', 'areas'];

  return (
    <div className="bg-white rounded-xl shadow-sm mb-5 border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = getLocationIcon(tab);
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TabIcon size={16} />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

