'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBars, FaBriefcase, FaBuilding, FaTimes, FaUserCircle } from 'react-icons/fa';
import HeaderSearchBar from '@/components/HeaderSearchBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const freeListingHref =
    isAdminOrManager
      ? '/dashboard/free-listing-enquiries'
      : '/free-listing';
  const freeListingLabel =
    isAdminOrManager
      ? 'Free Listing Enquiries'
      : 'Free Listing';
  const navLinks = [
    { href: '/jobs', label: 'Search Jobs' },
    { href: '/spa-near-me', label: 'SPAs Near Me' },
    { href: '/blog', label: 'Career Guides' },
    { href: freeListingHref, label: freeListingLabel, highlight: !isAdminOrManager },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-900 bg-brand-800 shadow-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        {/* Top Row: Logo, Search Bar, and Menu */}
        <div className="flex h-14 items-center gap-3 sm:h-16 lg:gap-4">
          {/* Logo */}
          <div className="flex min-w-0 flex-shrink-0 items-center">
            <Link href="/" className="flex h-full items-center" aria-label="Workspa home">
              <div className="flex h-10 w-auto items-center sm:h-12">
                <Image
                  src="/uploads/navbar.png"
                  alt="Workspa Logo"
                  width={200}
                  height={56}
                  className="h-full w-auto object-contain"
                  priority
                  unoptimized
                />
              </div>
            </Link>
          </div>

          {/* Search Bar - Inline in navbar */}
          <div className="hidden min-w-[220px] flex-1 lg:block lg:max-w-xl">
            <HeaderSearchBar />
          </div>

          {/* Desktop Menu */}
          <div className="hidden flex-shrink-0 items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.highlight
                    ? 'rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gold-600'
                    : `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? 'bg-white/10 text-white'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`
                }
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-white/10 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  My Dashboard
                </Link>
                <div className="ml-3 flex items-center gap-3 border-l border-white/20 pl-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <span className="text-sm font-bold text-brand-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-semibold text-white">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <Link href="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white">
                  Login
                </Link>
                <Link href="/register" className="rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gold-600">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 hover:text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FaTimes size={22} />
              ) : (
                <FaBars size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 pt-1 lg:hidden">
          <HeaderSearchBar />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full max-h-[calc(100vh-104px)] overflow-y-auto border-t border-white/15 bg-brand-800 px-3 py-4 shadow-2xl lg:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                    link.highlight
                      ? 'bg-gold-500 text-white shadow-sm hover:bg-gold-600'
                      : isActive(link.href)
                      ? 'bg-white/10 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.href === '/jobs' ? <FaBriefcase size={15} /> : <FaBuilding size={15} />}
                  {link.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="mt-4 border-t border-white/15 pt-4">
                <Link
                  href="/dashboard"
                  className={`mb-3 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                    isActive('/dashboard')
                      ? 'bg-white/10 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FaUserCircle size={16} />
                  My Dashboard
                </Link>
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <span className="text-base font-bold text-brand-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/70">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 border-t border-white/15 pt-4">
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-white/20 py-3 text-center text-sm font-bold text-white/90 transition hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full rounded-lg bg-gold-500 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-gold-600"
                >
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

