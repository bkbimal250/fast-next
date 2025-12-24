'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FaHome, FaSearch, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Animated 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-brand-600 leading-none mb-4 animate-pulse">
              404
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400 mx-auto rounded-full"></div>
          </div>

          {/* Main Message */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-2">
              The page you're looking for seems to have wandered off.
            </p>
            <p className="text-base text-gray-500">
              Don't worry, we'll help you find what you need!
            </p>
          </div>

          {/* Illustration/Icon */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-brand-100 rounded-full flex items-center justify-center animate-bounce">
                <svg 
                  className="w-16 h-16 sm:w-20 sm:h-20 text-brand-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/"
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 group"
            >
              <FaHome className="group-hover:scale-110 transition-transform" />
              <span>Go to Homepage</span>
            </Link>
            
            <Link
              href="/jobs"
              className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2 group"
            >
              <FaSearch className="group-hover:scale-110 transition-transform" />
              <span>Browse Jobs</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/jobs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <FaSearch className="text-brand-600" size={18} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                    Search Jobs
                  </div>
                  <div className="text-sm text-gray-500">Find your dream spa job</div>
                </div>
              </Link>

              <Link
                href="/spa-near-me"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <FaMapMarkerAlt className="text-brand-600" size={18} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                    SPAs Near Me
                  </div>
                  <div className="text-sm text-gray-500">Discover nearby spas</div>
                </div>
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                    About Us
                  </div>
                  <div className="text-sm text-gray-500">Learn more about us</div>
                </div>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                    Contact Us
                  </div>
                  <div className="text-sm text-gray-500">Get in touch</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
