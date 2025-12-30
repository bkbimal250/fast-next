'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { contactAPI, ContactSubject } from '@/lib/contact';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

// Note: Metadata is defined in layout.tsx (Next.js requires metadata in layout for client components)

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    subject: ContactSubject.OTHERS,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await contactAPI.submitContact({
        name: formData.name,
        phone: formData.phone,
        message: formData.message || undefined,
        subject: formData.subject,
      });
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        message: '',
        subject: ContactSubject.OTHERS,
      });
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - SPA Jobs Portal',
    description: 'Contact SPA Jobs Portal for inquiries, support, or feedback',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Workspa - SPA Jobs Portal',
      email: 'info@workspa.in',
      telephone: '+91 84228 55035',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
    },
  };

  return (

    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <Navbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <FaEnvelope color="#115e59" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@workspa.in" className="text-brand-600 hover:text-brand-700">
                      info@workspa.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <FaPhone color="#115e59" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+911234567890" className="text-brand-600 hover:text-brand-700">
                      +91  84228 55035
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt color="#115e59" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-50 rounded-lg border border-brand-200 p-6">
              <h3 className="font-semibold text-brand-900 mb-2">Response Time</h3>
              <p className="text-sm text-brand-700">
                We typically respond within 24-48 hours during business days. 
                For urgent matters, please call us directly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

            {success && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <FaCheckCircle color="#16a34a" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-green-700">Message sent successfully!</p>
                  <p className="text-sm text-green-600 mt-1">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <FaExclamationCircle color="#dc2626" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-red-700">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value as ContactSubject })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={ContactSubject.JOBS}>Jobs</option>
                  <option value={ContactSubject.JOBS_LISTING}>Jobs Listing</option>
                  <option value={ContactSubject.OTHERS}>Others</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your message (optional)"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    </>
  );
}

