'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { enquiryFreeListAPI, FreeListingEnquiryCreate } from '@/lib/enquiryFreeList';
import { getErrorMessage, showToast } from '@/lib/toast';

const initialFormData: FreeListingEnquiryCreate = {
  contact_name: '',
  phone: '',
  email: '',
  business_name: '',
  business_type: 'spa',
  address: '',
  city: '',
  website: '',
  message: '',
};

type FormErrors = Partial<Record<keyof FreeListingEnquiryCreate, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(-10);
}

function validateWebsite(value?: string) {
  const website = value?.trim();
  if (!website) return true;

  try {
    new URL(website.startsWith('http') ? website : `https://${website}`);
    return true;
  } catch {
    return false;
  }
}

function validateForm(data: FreeListingEnquiryCreate) {
  const nextErrors: FormErrors = {};
  const phone = normalizePhone(data.phone);

  if (!data.contact_name.trim()) {
    nextErrors.contact_name = 'Please enter your contact name.';
  } else if (data.contact_name.trim().length < 2) {
    nextErrors.contact_name = 'Name should be at least 2 characters.';
  }

  if (!phonePattern.test(phone)) {
    nextErrors.phone = 'Please enter a valid 10 digit mobile number.';
  }

  if (!emailPattern.test(data.email.trim())) {
    nextErrors.email = 'Please enter a valid email address.';
  }

  if (!data.business_name.trim()) {
    nextErrors.business_name = 'Please enter your shop or spa name.';
  }

  if (!data.city?.trim()) {
    nextErrors.city = 'Please enter your city.';
  }

  if (!data.address?.trim()) {
    nextErrors.address = 'Please enter your shop or spa address.';
  }

  if (!validateWebsite(data.website)) {
    nextErrors.website = 'Please enter a valid website or social link.';
  }

  return nextErrors;
}

function cleanPayload(data: FreeListingEnquiryCreate): FreeListingEnquiryCreate {
  return {
    contact_name: data.contact_name.trim(),
    phone: normalizePhone(data.phone),
    email: data.email.trim().toLowerCase(),
    business_name: data.business_name.trim(),
    business_type: data.business_type,
    address: data.address?.trim(),
    city: data.city?.trim(),
    website: data.website?.trim(),
    message: data.message?.trim(),
  };
}

export default function FreeListingPage() {
  const [formData, setFormData] = useState<FreeListingEnquiryCreate>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast.warning('Please check the form', 'Some details need correction before we can send your enquiry.');
      return;
    }

    setSubmitting(true);

    try {
      await enquiryFreeListAPI.submit(cleanPayload(formData));
      setFormData(initialFormData);
      setErrors({});
      showToast.success(
        'Enquiry received',
        'We will follow up with you and provide credentials after verification.'
      );
    } catch (err: any) {
      showToast.error('Failed to send enquiry', getErrorMessage(err) || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Free Listing</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">List Your Spa or Shop</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Send your business details. Our team will contact you, verify the listing, and share login credentials after follow-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Contact Name</label>
              <input
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className={`input-field ${errors.contact_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.contact_name)}
              />
              {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Phone</label>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Shop or Spa Name</label>
              <input
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className={`input-field ${errors.business_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.business_name)}
              />
              {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Business Type</label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="input-field bg-white"
              >
                <option value="spa">Spa</option>
                <option value="salon">Salon</option>
                <option value="wellness_center">Wellness Center</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`input-field ${errors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`input-field ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Website or Social Link</label>
              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`input-field ${errors.website ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="https://example.com or Instagram/Facebook page"
                aria-invalid={Boolean(errors.website)}
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Details</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Tell us about your hiring requirement or business listing."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Sending...' : 'Send Free Listing Enquiry'}
            </button>
            <Link href="/jobs" className="btn-secondary">
              Browse Jobs
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
