'use client';

import { useState, useEffect, useRef } from 'react';
import { Spa } from '@/lib/spa';

interface SpaSearchableDropdownProps {
  spas: Spa[];
  value: string;
  onChange: (spaId: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function SpaSearchableDropdown({
  spas,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
}: SpaSearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedSpa = spas.find((spa) => spa.id.toString() === value);

  useEffect(() => {
    if (value && spas.length > 0) {
      const selected = spas.find((spa) => spa.id.toString() === value);
      if (selected) {
        setSearchTerm(selected.name);
      }
    }
  }, [value, spas]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSpas = spas.filter((spa) =>
    spa.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpaSelect = (spa: Spa) => {
    onChange(spa.id.toString());
    setSearchTerm(spa.name);
    setShowDropdown(false);
  };

  if (disabled && selectedSpa) {
    return (
      <div>
        <input
          type="text"
          value={selectedSpa.name}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
        />
        <input type="hidden" name="spa_id" value={value} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) {
              onChange('');
            }
          }}
          onFocus={() => setShowDropdown(true)}
          className={`w-full px-4 py-3 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          }`}
          placeholder={value ? selectedSpa?.name : 'Search and select SPA...'}
          required={required}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto">
          {filteredSpas.length > 0 ? (
            filteredSpas.map((spa) => (
              <div
                key={spa.id}
                onClick={() => handleSpaSelect(spa)}
                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                  value === spa.id.toString() ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{spa.name}</div>
                {spa.address && <div className="text-sm text-gray-500 mt-0.5">{spa.address}</div>}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm text-center">No SPAs found</div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{typeof error === 'string' ? error : String(error)}</p>}
      <input type="hidden" name="spa_id" value={value} />
    </div>
  );
}

