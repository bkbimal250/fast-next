'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { locationAPI, City, Area } from '@/lib/location';
import { jobAPI } from '@/lib/job';

interface CityWithAreas extends City {
  areas: Area[];
  jobCount: number;
}

interface AreaWithCount extends Area {
  jobCount: number;
}

// Helper function to create slug from name
const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export default function Areasjobs() {
  const [citiesWithAreas, setCitiesWithAreas] = useState<CityWithAreas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areaJobCounts, setAreaJobCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchCitiesAndAreas();
  }, []);

  const fetchCitiesAndAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch job counts by location first (fast, single API call)
      const cityJobCounts = await jobAPI.getJobCountsByLocation();
      const cityCountMap = new Map(
        cityJobCounts.map((item) => [item.city_id, item.job_count])
      );

      // Step 2: Only fetch cities that have jobs (limit to top 50 cities with most jobs)
      const citiesWithJobs = cityJobCounts
        .sort((a, b) => b.job_count - a.job_count)
        .slice(0, 50)
        .map(item => item.city_id);

      // Step 3: Fetch city details only for cities with jobs
      const allCities = await locationAPI.getCities(undefined, undefined, 0, 1000);
      const relevantCities = allCities.filter((city: City) => 
        citiesWithJobs.includes(city.id) || (cityCountMap.get(city.id) ?? 0) > 0
      );

      // Step 4: Fetch areas for cities in parallel (but limit to top 30 cities for initial load)
      const topCities = relevantCities
        .map(city => ({
          city,
          jobCount: cityCountMap.get(city.id) || 0
        }))
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 30);

      const citiesData: CityWithAreas[] = await Promise.all(
        topCities.map(async ({ city, jobCount }) => {
          try {
            // Fetch areas for this city
            const areas = await locationAPI.getAreas(city.id, 0, 100);
            
            return {
              ...city,
              areas: areas.sort((a, b) => a.name.localeCompare(b.name)),
              jobCount,
            };
          } catch (err) {
            console.error(`Error fetching areas for city ${city.name}:`, err);
            return {
              ...city,
              areas: [],
              jobCount,
            };
          }
        })
      );

      // Step 5: Lazy load area job counts only for visible areas (defer this)
      // We'll load area counts on demand or in background
      const areaCounts: Record<number, number> = {};
      const allAreas = citiesData.flatMap(city => city.areas);
      
      // Only fetch counts for first 50 areas to speed up initial load
      const areasToCount = allAreas.slice(0, 50);
      const areaCountPromises = areasToCount.map(async (area: Area) => {
        try {
          const countData = await jobAPI.getJobCount({ area_id: area.id });
          return { areaId: area.id, count: countData.count };
        } catch {
          return { areaId: area.id, count: 0 };
        }
      });

      // Fetch area counts in background (don't block rendering)
      Promise.all(areaCountPromises).then(results => {
        const counts: Record<number, number> = {};
        results.forEach(({ areaId, count }) => {
          counts[areaId] = count;
        });
        setAreaJobCounts(prev => ({ ...prev, ...counts }));
      }).catch(console.error);

      // Filter and sort cities
      const filteredCities = citiesData
        .filter((city) => city.jobCount > 0 || city.areas.length > 0)
        .sort((a, b) => {
          if (b.jobCount !== a.jobCount) {
            return b.jobCount - a.jobCount;
          }
          return b.areas.length - a.areas.length;
        });

      setCitiesWithAreas(filteredCities);
      setLoading(false); // Set loading to false immediately after cities are loaded
    } catch (err) {
      console.error('Error fetching cities and areas:', err);
      setError('Failed to load location data. Please try again later.');
      setLoading(false);
    }
  };

  // Group cities by state (if available) or show all together
  const groupedCities = citiesWithAreas.reduce((acc, city) => {
    const stateName = city.state?.name || 'Other Cities';
    if (!acc[stateName]) {
      acc[stateName] = [];
    }
    acc[stateName].push(city);
    return acc;
  }, {} as Record<string, CityWithAreas[]>);

  // Prioritize Mumbai Metropolitan Region cities
  const priorityStates = ['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka'];
  const sortedStateNames = Object.keys(groupedCities).sort((a, b) => {
    const aIndex = priorityStates.indexOf(a);
    const bIndex = priorityStates.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  // Show skeleton loader while loading
  if (loading && citiesWithAreas.length === 0) {
    return (
      <section className="mb-12 sm:mb-16 bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-gray-600">Loading locations...</p>
          </div>
          {/* Skeleton loader */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12 sm:mb-16 bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 sm:mb-16 bg-white rounded-lg shadow-sm p-8 sm:p-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Spa Jobs Across India
        </h2>

        <p className="text-gray-700 text-base sm:text-lg mb-8 text-center">
          Find verified spa therapist, massage therapist, and spa manager jobs in
          prime locations across major cities
        </p>

        {/* Cities and Areas Grid */}
        <div className="space-y-8">
          {sortedStateNames.map((stateName) => {
            const cities = groupedCities[stateName];
            if (cities.length === 0) return null;

            return (
              <div key={stateName} className="border-b border-gray-200 pb-8 last:border-b-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {stateName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => {
                    const citySlug = createSlug(city.name);
                    const hasAreas = city.areas.length > 0;
                    const hasJobs = city.jobCount > 0;

                    return (
                      <div
                        key={city.id}
                        className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {city.name}
                          </h4>
                          {hasJobs && (
                            <span className="text-sm font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded">
                              {city.jobCount} {city.jobCount === 1 ? 'job' : 'jobs'}
                            </span>
                          )}
                        </div>

                        {hasAreas ? (
                          <ul className="space-y-2 text-gray-700">
                            {city.areas
                              .filter((area) => areaJobCounts[area.id] > 0 || city.jobCount > 0)
                              .slice(0, 6)
                              .map((area) => {
                                const areaSlug = createSlug(area.name);
                                const areaJobCount = areaJobCounts[area.id] || 0;
                                return (
                                  <li key={area.id} className="flex items-center justify-between">
                                    <Link
                                      href={`/cities/${citySlug}/${areaSlug}`}
                                      className="hover:text-brand-600 underline flex-1"
                                    >
                                      Spa Jobs in {area.name}
                                    </Link>
                                    {areaJobCount > 0 && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        {areaJobCount}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            {city.areas.length > 6 && (
                              <li>
                                <Link
                                  href={`/cities/${citySlug}`}
                                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                                >
                                  View all {city.areas.length} areas →
                                </Link>
                              </li>
                            )}
                          </ul>
                        ) : hasJobs ? (
                          <Link
                            href={`/cities/${citySlug}`}
                            className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                          >
                            View jobs in {city.name} →
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-500">No jobs available</p>
                        )}

                        {/* City-level link */}
                        {hasJobs && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Link
                              href={`/cities/${citySlug}`}
                              className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                            >
                              All jobs in {city.name} →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Choose Section */}
        <div className="mt-12 bg-brand-50 rounded-lg p-6 sm:p-8 border border-brand-200">
          <h3 className="font-semibold text-xl text-gray-900 mb-4">
            Why Choose Work Spa Portal?
          </h3>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span>
                <strong>1000+ Active Jobs</strong> across major cities including Mumbai,
                Navi Mumbai, Thane, Delhi, Bangalore, and more
              </span>
            </li>

            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span>
                <strong>Verified Spas</strong> – Trusted & authentic listings from
                verified employers
              </span>
            </li>

            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span>
                <strong>No Login Required</strong> – Apply directly to spas without
                registration
              </span>
            </li>

            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span>
                <strong>Area-Based Search</strong> – Find spa jobs in your preferred
                location
              </span>
            </li>

            <li className="flex items-start">
              <span className="text-brand-600 mr-2">✓</span>
              <span>
                <strong>Daily Updates</strong> – Fresh spa jobs added daily from
                verified spas
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
