'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobAPI, JobCategory } from '@/lib/job';
import {
  FaBriefcase,
  FaUser,
  FaHeart,
  FaHeadphones,
  FaUsers,
  FaCog,
  FaSpa,
  FaHandSparkles,
  FaUserTie,
  FaLaptop
} from 'react-icons/fa';

interface CategoryWithCount extends JobCategory {
  jobCount: number;
}

// Map category names to icons and colors (matching design)
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();

  // Spa Therapist - Light green with star/sparkle
  if (name.includes('spa') && name.includes('therapist')) {
    return { icon: FaHandSparkles, color: 'bg-green-100 text-green-600' };
  }
  // Massage Therapist - Light pink with heart
  if (name.includes('massage') && name.includes('therapist')) {
    return { icon: FaHeart, color: 'bg-pink-100 text-pink-600' };
  }
  // Beauty Specialist - Light purple with person icon
  if (name.includes('beauty') || name.includes('specialist')) {
    return { icon: FaUser, color: 'bg-purple-100 text-purple-600' };
  }
  // Receptionist - Light blue with headphones
  if (name.includes('receptionist') || name.includes('reception')) {
    return { icon: FaHeadphones, color: 'bg-blue-100 text-blue-600' };
  }
  // Spa Manager - Light orange with people icon
  if (name.includes('manager') || name.includes('spa manager')) {
    return { icon: FaUsers, color: 'bg-orange-100 text-orange-600' };
  }
  // Wellness Coach - Light teal with gear icon
  if (name.includes('wellness') || name.includes('coach')) {
    return { icon: FaCog, color: 'bg-teal-100 text-teal-600' };
  }
  // General Therapist - Light green
  if (name.includes('therapist')) {
    return { icon: FaSpa, color: 'bg-green-100 text-green-600' };
  }

  // Default
  return { icon: FaBriefcase, color: 'bg-gray-100 text-gray-600' };
};

export default function JobCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all job categories
      const jobCategories = await jobAPI.getJobCategories(0, 100);

      // Fetch job count for each category
      const categoriesWithCounts: CategoryWithCount[] = await Promise.all(
        jobCategories.map(async (category: JobCategory) => {
          try {
            const countData = await jobAPI.getJobCount({
              job_category: category.name
            });
            return {
              ...category,
              jobCount: countData.count,
            };
          } catch (err) {
            console.error(`Error fetching count for category ${category.name}:`, err);
            return {
              ...category,
              jobCount: 0,
            };
          }
        })
      );

      // Filter categories with jobs and sort by count (descending)
      const filteredCategories = categoriesWithCounts
        .filter((cat) => cat.jobCount > 0)
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 6); // Show top 6 categories

      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching job categories:', err);
      setError('Failed to load job categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Browse Jobs by Category
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore opportunities across different wellness and spa roles
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {categories.map((category) => {
            const { icon: Icon, color } = getCategoryIcon(category.name);

            return (
              <Link
                key={category.id}
                href={`/jobs?job_category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-brand-300 transition-all duration-300 h-full">

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Category Name */}
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>

                  {/* Job Count */}
                  <p className="text-sm sm:text-base text-gray-600">
                    {category.jobCount}+ jobs
                  </p>
                </div>
              </Link>
            );
          })}
        </div>


        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base sm:text-lg"
          >
            View All Job Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
