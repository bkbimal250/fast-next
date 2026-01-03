/**
 * Utility functions for job detail page
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

export interface JobWithRelations {
  id: number;
  title: string;
  slug: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_years_min?: number;
  experience_years_max?: number;
  job_opening_count?: number;
  key_skills?: string;
  hr_contact_phone?: string;
  view_count?: number;
  created_at: string;
  expires_at?: string;
  city_id?: number;
  postalCode?: string;
  Industry_type?: string;
  Employee_type?: string;
  required_gender?: string;
  spa?: {
    id: number;
    name: string;
    slug: string;
    address?: string;
    logo_image?: string;
    rating?: number;
    reviews?: number;
    is_verified?: boolean;
  };
  job_type?: { id: number; name: string; slug: string };
  job_category?: { id: number; name: string; slug: string };
  state?: { id: number; name: string };
  city?: { id: number; name: string };
  area?: { id: number; name: string };
  country?: { id: number; name: string };
  created_by_user?: {
    id: number;
    name: string;
    profile_photo?: string;
    email?: string;
  };
}

/**
 * Format salary range
 */
export function formatSalary(job: JobWithRelations): string {
  if (!job.salary_min && !job.salary_max) return 'Not Disclosed';
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };
  if (job.salary_min && job.salary_max) {
    return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)} Per Month`;
  }
  if (job.salary_min) return `${formatAmount(job.salary_min)}+ PA`;
  if (job.salary_max) return `Up to ${formatAmount(job.salary_max)} Per Month`;
  return 'Not Disclosed';
}

/**
 * Format experience range
 */
export function formatExperience(job: JobWithRelations): string | null {
  if (!job.experience_years_min && !job.experience_years_max) return null;
  if (job.experience_years_min && job.experience_years_max) {
    return `${job.experience_years_min} - ${job.experience_years_max} years`;
  }
  if (job.experience_years_min) return `${job.experience_years_min}+ years`;
  if (job.experience_years_max) return `0 - ${job.experience_years_max} years`;
  return null;
}

/**
 * Format date
 */
export function formatDate(dateString: string | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = Date.now();
  const dateTime = date.getTime();
  const diffMs = dateTime - now;
  const daysDiff = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  
  // If date is in the future (expiry date)
  if (diffMs > 0) {
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff < 7) return `in ${daysDiff} days`;
    if (daysDiff < 30) return `in ${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''}`;
    if (daysDiff < 365) return `in ${Math.floor(daysDiff / 30)} month${Math.floor(daysDiff / 30) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  
  // If date is in the past (posted date)
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return '1 day ago';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff < 14) return '1 week ago';
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
  if (daysDiff < 60) return '1 month ago';
  return `${Math.floor(daysDiff / 30)}+ months ago`;
}

/**
 * Parse skills from string
 */
export function parseSkills(skillsString?: string): string[] {
  if (!skillsString) return [];
  return skillsString.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
}

/**
 * Parse responsibilities from string
 */
export function parseResponsibilities(responsibilitiesString?: string): string[] {
  if (!responsibilitiesString) return [];
  return responsibilitiesString
    .split(/\n/)
    .map(s => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone?: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${withoutZero}`;
}

/**
 * Format phone number for call
 */
export function formatPhoneForCall(phone?: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${withoutZero}`;
}

/**
 * Get logo URL
 */
export function getLogoUrl(logoImage?: string): string | null {
  if (!logoImage) return null;
  return `${API_URL}${logoImage.startsWith('/') ? logoImage : `/${logoImage}`}`;
}

/**
 * Get initials for fallback
 */
export function getInitials(name?: string): string {
  if (!name) return 'SP';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

