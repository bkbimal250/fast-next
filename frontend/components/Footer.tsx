'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram
} from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()

  const canPostJobs =
    user && ['admin', 'manager', 'recruiter'].includes(user.role)

  const maharashtraCityLinks = [
    { label: 'Spa Jobs in Mumbai', href: '/spa-jobs-in-mumbai' },
    { label: 'Spa Jobs in Thane', href: '/spa-jobs-in-thane' },
    { label: 'Spa Jobs in Navi Mumbai', href: '/spa-jobs-in-navi-mumbai' },
    { label: 'Spa Jobs in Pune', href: '/spa-jobs-in-pune' },
    { label: 'Spa Jobs in Nashik', href: '/spa-jobs-in-nashik' },
    { label: 'Spa Jobs in Nagpur', href: '/spa-jobs-in-nagpur' },
    { label: 'Spa Jobs in Pimpri Chinchwad', href: '/spa-jobs-in-pimpri-chinchwad' },
    { label: 'Spa Jobs in Kalyan', href: '/spa-jobs-in-kalyan' },
  ]

  const jobCategoryLinks = [
    { label: 'Spa Therapist Jobs', href: '/jobs?q=Spa%20Therapist' },
    { label: 'Female Spa Therapist Jobs', href: '/jobs?q=Female%20Spa%20Therapist' },
    { label: 'Massage Therapist Jobs', href: '/jobs?q=Massage%20Therapist' },
    { label: 'Ayurvedic Therapist Jobs', href: '/jobs?q=Ayurvedic%20Therapist' },
    { label: 'Beautician Jobs', href: '/jobs?q=Beautician' },
    { label: 'Spa Manager Jobs', href: '/jobs?q=Spa%20Manager' },
    { label: 'Fresher Spa Jobs', href: '/jobs?q=Fresher%20Spa' },
    { label: 'Part Time Spa Jobs', href: '/jobs?job_type=part-time' },
  ]

  const footerPillClass =
    'inline-flex rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/15 hover:text-white'

  return (
    <footer className="bg-brand-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">

          {/* ================= Company Info ================= */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/uploads/navbar.png"
                alt="Workspa Logo"
                width={160}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            <p className="text-white/80 text-sm leading-relaxed">
              India&apos;s leading platform for spa job opportunities.
              Connect with verified spas and build your career in wellness.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61587204471016"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <FaFacebook size={16} />
              </a>

              <a
                href="https://x.com/workspa123"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <FaTwitter size={16} />
              </a>

              <a
                href="https://www.linkedin.com/in/work-india-6154303a7/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <FaLinkedin size={16} />
              </a>

              <a
                href="https://www.instagram.com/work__spa/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* ================= Quick Links ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs" className="text-white/80 hover:text-white">Browse Jobs</Link></li>
              <li><Link href="/jobs?is_featured=true" className="text-white/80 hover:text-white">Featured Jobs</Link></li>
              <li><Link href="/spa-near-me" className="text-white/80 hover:text-white">SPAs Near Me</Link></li>
              <li><Link href="/spa-jobs-near-me" className="text-white/80 hover:text-white">Spa Jobs Near Me</Link></li>
              <li><Link href="/blog" className="text-white/80 hover:text-white">Career Blog</Link></li>
              <li><Link href="/blog/how-to-apply-for-spa-jobs" className="text-white/80 hover:text-white">How to Apply</Link></li>
              <li><Link href="/blog/spa-job-salary-in-india" className="text-white/80 hover:text-white">Salary Guide</Link></li>
              <li><Link href="/jobs?job_type=full-time" className="text-white/80 hover:text-white">Full Time Jobs</Link></li>
              <li><Link href="/jobs?job_type=part-time" className="text-white/80 hover:text-white">Part Time Jobs</Link></li>
            </ul>
          </div>

          {/* ================= For Employers ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide">
              For Employers
            </h3>

            <ul className="space-y-2.5 text-sm">
              {user ? (
                <>
                  {canPostJobs && (
                    <>
                      <li><Link href="/dashboard/jobs/create" className="text-white/80 hover:text-white">Post a Job</Link></li>
                      <li><Link href="/dashboard/jobs" className="text-white/80 hover:text-white">Manage Jobs</Link></li>
                    </>
                  )}

                  {(user.role === 'admin' || user.role === 'manager') && (
                    <li>
                      <Link href="/dashboard/free-listing-enquiries" className="text-white/80 hover:text-white">
                        Free Listing Enquiries
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link href="/dashboard" className="text-white/80 hover:text-white">
                      {user.role === 'admin'
                        ? 'Admin Dashboard'
                        : user.role === 'manager'
                        ? 'Manager Dashboard'
                        : user.role === 'recruiter'
                        ? 'Recruiter Dashboard'
                        : 'My Dashboard'}
                    </Link>
                  </li>

                  {(user.role === 'admin' || user.role === 'manager') && (
                    <li><Link href="/dashboard/spas" className="text-white/80 hover:text-white">Manage SPAs</Link></li>
                  )}

                  {user.role === 'admin' && (
                    <li><Link href="/dashboard/analytics" className="text-white/80 hover:text-white">Analytics</Link></li>
                  )}
                </>
              ) : (
                <>
                  <li><Link href="/free-listing" className="text-white/80 hover:text-white">Free Listing Enquiry</Link></li>
                  <li><Link href="/blog/free-listing-for-spa-businesses" className="text-white/80 hover:text-white">Free Listing Guide</Link></li>
                  <li><Link href="/jobs" className="text-white/80 hover:text-white">Browse Candidates&apos; Jobs</Link></li>
                  <li><Link href="/register" className="text-white/80 hover:text-white">Create Account</Link></li>
                  <li><Link href="/login" className="text-white/80 hover:text-white">Login</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* ================= Contact Info ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide">
              Contact Us
            </h3>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <FaMapMarkerAlt className="mt-1 text-sky-300" />
                <span className="text-white/80">India</span>
              </li>

              <li className="flex gap-3">
                <FaPhone className="text-sky-300" />
                <div className="flex flex-col">
                  <a href="tel:+919126458453" className="text-white/80 hover:text-white">+91 9126458453</a>
                  <a href="tel:+919876543210" className="text-white/80 hover:text-white">+91 98765 43210</a>
                </div>
              </li>

              <li className="flex gap-3">
                <FaEnvelope className="text-sky-300" />
                <div className="flex flex-col break-all">
                  <a href="mailto:contact.workspa@gmail.com" className="text-white/80 hover:text-white">
                    contact.workspa@gmail.com
                  </a>
                  <a href="mailto:sendjob.workspa@gmail.com" className="text-white/80 hover:text-white">
                    sendjob.workspa@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex gap-3">
                <FaGlobe className="text-sky-300" />
                <a
                  href="https://workspa.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white"
                >
                  www.workspa.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= SEO Job Links ================= */}
        <div className="mt-10 border-t border-white/15 pt-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h3 className="mb-4 text-sm font-bold text-white">
                Spa Jobs by City
              </h3>
              <div className="flex flex-wrap gap-2">
                {maharashtraCityLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={footerPillClass}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-bold text-white">
                Top Job Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobCategoryLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={footerPillClass}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ================= Bottom Bar ================= */}
        <div className="border-t border-white/20 mt-12 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-white/70 text-center sm:text-left">
              © {currentYear} Workspa. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link href="/privacy" className="text-white/70 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-white/70 hover:text-white">Terms of Service</Link>
              <Link href="/about" className="text-white/70 hover:text-white">About Us</Link>
              <Link href="/free-listing" className="text-white/70 hover:text-white">Free Listing</Link>
              <Link href="/blog" className="text-white/70 hover:text-white">Blog</Link>
              <Link href="/contact" className="text-white/70 hover:text-white">Contact</Link>
              <Link href="/sitemap" className="text-white/70 hover:text-white">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
