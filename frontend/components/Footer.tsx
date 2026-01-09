'use client';

import Link from 'next/link';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // Check if user can post jobs (admin, manager, or recruiter)
  const canPostJobs = user && (user.role === 'admin' || user.role === 'manager' || user.role === 'recruiter');

  return (
    <footer className="bg-brand-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Link href="/" className="flex items-center">
                <div className="h-12 w-auto flex items-center">
                  <Image 
                    src="/uploads/navbar.png" 
                    alt="Workspa Logo" 
                    width={160} 
                    height={48} 
                    className="h-full w-auto object-contain" 
                  />
                </div>
              </Link>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              India's leading platform for spa job opportunities. Connect with verified spas and find your dream career in wellness.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={16} color="white" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={16} color="white" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={16} color="white" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={16} color="white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/jobs" className="text-white/80 hover:text-white transition-colors text-sm">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?is_featured=true" className="text-white/80 hover:text-white transition-colors text-sm">
                  Featured Jobs
                </Link>
              </li>
              <li>
                <Link href="/spa-near-me" className="text-white/80 hover:text-white transition-colors text-sm">
                  SPAs Near Me
                </Link>
              </li>
              <li>
                <Link href="/jobs?job_type=full-time" className="text-white/80 hover:text-white transition-colors text-sm">
                  Full Time Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?job_type=part-time" className="text-white/80 hover:text-white transition-colors text-sm">
                  Part Time Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">For Employers</h3>
            <ul className="space-y-2.5">
              {user ? (
                <>
                  {canPostJobs && (
                    <>
                      <li>
                        <Link href="/dashboard/jobs/create" className="text-white/80 hover:text-white transition-colors text-sm">
                          Post a Job
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/jobs" className="text-white/80 hover:text-white transition-colors text-sm">
                          Manage Jobs
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors text-sm">
                      {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'manager' ? 'Manager Dashboard' : user.role === 'recruiter' ? 'Recruiter Dashboard' : 'My Dashboard'}
                    </Link>
                  </li>
                  {user.role === 'admin' || user.role === 'manager' ? (
                    <li>
                      <Link href="/dashboard/spas" className="text-white/80 hover:text-white transition-colors text-sm">
                        Manage SPAs
                      </Link>
                    </li>
                  ) : null}
                  {user.role === 'admin' ? (
                    <li>
                      <Link href="/dashboard/analytics" className="text-white/80 hover:text-white transition-colors text-sm">
                        Analytics
                      </Link>
                    </li>
                  ) : null}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/dashboard/jobs/create" className="text-white/80 hover:text-white transition-colors text-sm">
                      Post a Job
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-white/80 hover:text-white transition-colors text-sm">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm">
                      Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  <FaMapMarkerAlt size={16} color="#7dd3fc" />
                </div>
                <span className="text-white/80 text-sm leading-relaxed">
                  India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex-shrink-0">
                  <FaPhone size={16} color="#7dd3fc" />
                </div>
                <a href="tel:+911234567890" className="text-white/80 hover:text-white transition-colors text-sm">
                  +91 9152120246
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex-shrink-0">
                  <FaEnvelope size={16} color="#7dd3fc" />
                </div>
                <a href="mailto:info@workspa.in" className="text-white/80 hover:text-white transition-colors text-sm break-all">
                  info@workspa.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex-shrink-0">
                  <FaGlobe size={16} color="#7dd3fc" />
                </div>
                <a href="https://workspa.in" className="text-white/80 hover:text-white transition-colors text-sm">
                  www.workspa.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm text-center sm:text-left">
              <p>&copy; {currentYear} Work Spa. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

