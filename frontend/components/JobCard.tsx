'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI } from '@/lib/application';
import axios from 'axios';
import { FaRupeeSign, FaBriefcase, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaEye, FaWhatsapp, FaPhone, FaUser } from 'react-icons/fa';
import { showToast, showErrorToast } from '@/lib/toast';

interface JobCardProps {
  id: number;
  title: string;
  spa?: string;
  spaName?: string;
  spaAddress?: string;
  logoImage?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  jobOpeningCount?: number;
  jobType?: string;
  jobCategory?: string;
  slug: string;
  isFeatured?: boolean;
  viewCount?: number;
  created_at?: string;
  description?: string;
  postedBy?: {
    id?: number;
    name?: string;
    profile_photo?: string;
  };
  hr_contact_phone?: string;
  required_gender?: string;
}

export default function JobCard({
  id,
  title,
  spaName,
  spaAddress,
  logoImage,
  location,
  salaryMin,
  salaryMax,
  salaryCurrency = 'INR',
  experienceMin,
  experienceMax,
  jobOpeningCount,
  jobType,
  jobCategory,
  slug,
  isFeatured,
  viewCount,
  created_at,
  description,
  postedBy,
  hr_contact_phone,
  required_gender,
}: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const formatSalary = () => {
    if (!salaryMin && !salaryMax) return null;
    const formatAmount = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${(amount / 1000).toFixed(0)}k`;
    };

    if (salaryMin && salaryMax) {
      return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)} Per Month`;
    }
    if (salaryMin) return `${formatAmount(salaryMin)}+ Per Month`;
    if (salaryMax) return `Up to ${formatAmount(salaryMax)} Per Month`;
    return null;
  };

  const formatExperience = () => {
    if (!experienceMin && !experienceMax) return null;
    if (experienceMin && experienceMax) {
      return `${experienceMin} - ${experienceMax} yrs`;
    }
    if (experienceMin) return `${experienceMin}+ yrs`;
    if (experienceMax) return `0 - ${experienceMax} yrs`;
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    const months = Math.floor(daysAgo / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  // Format location display - only show if we have a valid location (city or area)
  const displayLocation = location && location !== 'Location not specified' ? location : null;

  // Truncate description to approximately 30 words
  const truncateDescription = (text?: string, maxWords: number = 30) => {
    if (!text) return null;
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Construct logo image URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';
  const logoUrl = logoImage 
    ? `${API_URL}${logoImage.startsWith('/') ? logoImage : `/${logoImage}`}`
    : null;
  
  // Construct profile photo URL
  const profilePhotoUrl = postedBy?.profile_photo
    ? `${API_URL}${postedBy.profile_photo.startsWith('/') ? postedBy.profile_photo : `/${postedBy.profile_photo}`}`
    : null;
  
  // Get initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return 'SP';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // If it starts with +, keep it, otherwise assume it's Indian number and add +91
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    // Remove leading 0 if present
    const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    return `+91${withoutZero}`;
  };

  // Format phone number for call (tel: link)
  const formatPhoneForCall = (phone?: string) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // If it starts with +, keep it, otherwise assume it's Indian number and add +91
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    // Remove leading 0 if present
    const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    return `+91${withoutZero}`;
  };

  const whatsappUrl = hr_contact_phone 
    ? `https://wa.me/${formatPhoneForWhatsApp(hr_contact_phone)?.replace('+', '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${title} position at ${spaName || 'your company'}.`)}`
    : null;

  const callUrl = hr_contact_phone 
    ? `tel:${formatPhoneForCall(hr_contact_phone)}`
    : null;

  // Handle apply button click - direct apply for logged-in users
  const handleApplyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track apply click
    axios.post(`${API_URL}/api/jobs/${id}/track-apply-click`).catch(() => {});

    // If user is logged in, apply directly
    if (user) {
      setApplying(true);
      try {
        await applicationAPI.directApply(id);
        showToast.success('Application submitted successfully!');
        // Redirect to applications page after a short delay
        setTimeout(() => {
          router.push('/dashboard/applications');
        }, 1500);
      } catch (err: any) {
        console.error('Failed to submit application:', err);
        const errorMessage = err.response?.data?.detail || 'Failed to submit application. Please try again.';
        showErrorToast(err, errorMessage);
      } finally {
        setApplying(false);
      }
    } else {
      // If not logged in, redirect to apply page
      router.push(`/apply/${slug}`);
    }
  };

  return (
    <Link href={`/jobs/${slug}`} className="block">
      <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
        {/* Featured Badge - Top Right */}
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md z-10">
            ⭐ Featured
          </div>
        )}

        <div className="flex gap-3 sm:gap-4">
          {/* SPA Logo/Avatar - Left Side */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-white flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={spaName || 'SPA Logo'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md group-hover:shadow-lg transition-shadow">
                {getInitials(spaName)}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Section with Apply Button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                {/* Job Title */}
                <h3 className="text-base sm:text-lg font-semibold text-brand-600 group-hover:text-brand-700 transition-colors mb-1.5 line-clamp-2 leading-tight">
                  {title}
                </h3>
                
                {/* SPA Name */}
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2.5 sm:mb-3">
                  {spaName || 'SPA'}
                </p>

                {/* Key Info Row - Salary, Experience, Location */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  {formatSalary() && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 text-gold-600 flex-shrink-0">
                        <FaRupeeSign size={16} />
                      </div>
                      <span className="font-semibold text-gray-900">{formatSalary()}</span>
                    </div>
                  )}
                  {formatExperience() && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 text-brand-600 flex-shrink-0">
                        <FaBriefcase size={16} />
                      </div>
                      <span>{formatExperience()}</span>
                    </div>
                  )}


                  {displayLocation && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0">
                        <FaMapMarkerAlt size={14} />
                      </div>
                      <span className="truncate max-w-[150px] sm:max-w-[250px]" title={displayLocation}>{displayLocation}</span>
                    </div>
                  )}
                  {jobOpeningCount !== undefined && jobOpeningCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 text-brand-600 flex-shrink-0">
                        <FaUsers size={16} />
                      </div>
                      <span className="text-gray-900 font-medium">{jobOpeningCount} {jobOpeningCount === 1 ? 'opening' : 'openings'}</span>
                    </div>
                  )}
                  {required_gender && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 text-purple-600 flex-shrink-0">
                        <FaUser size={16} />
                      </div>
                      <span className="text-gray-600">{required_gender === 'Any' ? 'Any Gender' : `${required_gender} Only`}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button - Right Side */}
              <div className="flex flex-row sm:flex-col items-stretch sm:items-end gap-2 flex-shrink-0 w-full sm:w-auto">
                
                {hr_contact_phone && (
                  <>
                    {callUrl && (
                      <a
                        href={callUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap text-xs sm:text-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                        title="Call HR"
                      >
                        <FaPhone size={12} />
                        <span className="hidden sm:inline">Call</span>
                      </a>
                    )}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap text-xs sm:text-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                        title="WhatsApp HR"
                      >
                        <FaWhatsapp size={14} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}
                  </>
                )}
                <button
                  onClick={handleApplyClick}
                  disabled={applying}
                  className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap text-xs sm:text-sm flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Applying...' : user ? 'Apply Now' : 'Quick Apply'}
                </button>
              </div>
            </div>

            {/* Description Preview - Limited to ~30 words */}
            {description && truncateDescription(description) && (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                {truncateDescription(description)}
              </p>
            )}

            {/* Footer Section - Tags and Metadata */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 mt-2">
              {/* Job Type & Category Tags */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {jobType && (
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
                    {jobType}
                  </span>
                )}
                {jobCategory && (
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-800 border border-brand-300">
                    {jobCategory}
                  </span>
                )}
              </div>

              {/* Metadata - Posted By, Date & Views */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                {/* Posted By */}
                {postedBy?.name && (
                  <div className="flex items-center gap-1.5">
                    {profilePhotoUrl ? (
                      <Image
                        src={profilePhotoUrl}
                        alt={postedBy.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                        {getInitials(postedBy.name)}
                      </div>
                    )}
                    <span className="text-gray-600 font-medium">Posted by {postedBy.name}</span>
                  </div>
                )}
                {formatDate(created_at) && (
                  <span className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5">
                      <FaCalendarAlt size={14} />
                    </div>
                    {formatDate(created_at)}
                  </span>
                )}
                {viewCount !== undefined && viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5">
                      <FaEye size={14} />
                    </div>
                    {viewCount} views
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-gold-500 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </Link>
  );
}
