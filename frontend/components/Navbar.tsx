'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Naukri Style */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-blue-600 hidden sm:block">SPA Jobs</span>
            </Link>
          </div>

          {/* Desktop Menu - Naukri Style */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Search Jobs
            </Link>
            <Link href="/spa-near-me" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              SPAs Near Me
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  My Dashboard
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 px-3 py-1 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            <Link href="/jobs" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
              Search Jobs
            </Link>
            <Link href="/spa-near-me" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
              SPAs Near Me
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
                  My Dashboard
                </Link>
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <button onClick={logout} className="w-full btn-secondary text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 py-2 border-t border-gray-200 mt-2 space-y-2">
                <Link href="/login" className="block w-full text-center text-gray-700 hover:bg-gray-50 py-2 rounded-md font-medium">
                  Login
                </Link>
                <Link href="/register" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

