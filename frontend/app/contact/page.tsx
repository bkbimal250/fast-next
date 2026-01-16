'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaClock, FaHeadset, FaPaperPlane } from 'react-icons/fa';
import { contactAPI, ContactSubject } from '@/lib/contact';
import Navbar from '@/components/Navbar';
import SubscribeForm from '@/components/SubscribeForm';
import type { Metadata } from 'next';

// Note: Metadata is defined in layout.tsx (Next.js requires metadata in layout for client components)

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    subject: ContactSubject.Therapist,
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
        subject: ContactSubject.Therapist,
      });
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      // Handle validation errors properly
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle Pydantic validation errors
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Multiple validation errors
            const errors = errorData.detail.map((e: any) => {
              const field = e.loc?.join('.') || 'field';
              return `${field}: ${e.msg}`;
            });
            errorMessage = errors.join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = 'Validation error. Please check your input.';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - Work Spa Portal',
    description: 'Contact Work Spa Portal for inquiries, support, or feedback',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Workspa - Work Spa Portal',
      email: 'info@workspa.in',
      telephone: '+919152120246',
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
      
 {/* Hero Section */}
<section className="relative w-full overflow-hidden bg-black">
  {/* Fixed Hero Height */}
  <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[900px] mt-1 mb-1">

    {/* Hero Image */}
    <Image
      src="/uploads/workspacontact.png"
      alt="We Are Hiring Spa Jobs"
      fill
      priority
      className="object-cover object-center"
      sizes="100vw"
    />

    {/* Dark Gradient Overlay (for readability if needed later) */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>

    {/* Optional Content Overlay */}
    <div className="absolute inset-0 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl text-white">
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-semibold">
            We Are Hiring
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Join Our Spa Team
          </h1>
          <p className="mt-4 text-white/90 text-sm sm:text-base">
            Therapist • Manager • Receptionist • Housekeeping • Beautician
          </p>
        </div>
      </div>
    </div>

  </div>
</section>


      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          {/* Contact Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaEnvelope className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Email Us</h3>
              <a href="mailto:info@workspa.in" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                info@workspa.in
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaPhone className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Call Us</h3>
              <a href="tel:+919152120246" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                +91 9152120246
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaMapMarkerAlt className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Location</h3>
              <p className="text-gray-600 font-medium">Navi Mumbai, Maharashtra, India</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaHeadset className="text-brand-600" size={24} />
                    Contact Information
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <FaEnvelope className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
                        <a href="mailto:info@workspa.in" className="text-brand-600 hover:text-brand-700 font-medium">
                          info@workspa.in
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <FaPhone className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                        <a href="tel:+919152120246" className="text-brand-600 hover:text-brand-700 font-medium">
                          +91 9152120246
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <FaMapMarkerAlt className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Office Location</h3>
                        <p className="text-gray-600 font-medium">Navi Mumbai, Maharashtra, India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border-2 border-brand-200 p-6 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center">
                      <FaClock className="text-white" size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-900 mb-2 text-lg">Response Time</h3>
                    <p className="text-brand-700 leading-relaxed">
                      We typically respond within <span className="font-semibold">24-48 hours</span> during business days. 
                      For urgent matters, please call us directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gold-50 rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FaPaperPlane className="text-brand-600" size={24} />
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you soon.</p>

                {success && (
                  <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <FaCheckCircle className="text-green-600" size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-lg">Message sent successfully!</p>
                      <p className="text-sm text-green-700 mt-1">
                        We'll get back to you as soon as possible. Thank you for contacting us!
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <FaExclamationCircle className="text-red-600" size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-lg">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value as ContactSubject })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white"
                    >
                      
                      <option value={ContactSubject.Therapist}>Female Therapist jobs</option>
                      <option value={ContactSubject.spaTherapist}>Thai Therapist jobs</option>
                      <option value={ContactSubject.manager}>Male Spa Manager jobs</option>
                      <option value={ContactSubject.receptionist}>Female Receptionist jobs</option>
                      <option value={ContactSubject.housekeeping}>Male Housekeeping jobs</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-gray-500 text-xs font-normal">(eg mumbai or navi mumbai)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-4 rounded-xl font-bold hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={18} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
            <SubscribeForm />
          </div>
        </div>
      </div>

    </>
  );
}

