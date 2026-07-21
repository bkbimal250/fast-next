'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ContactPopup from '@/app/Popup/ContactPopup';

const POPUP_SESSION_KEY = 'workspa_contact_popup_seen';

/**
 * Triggers contact popup after 10 seconds
 * Disabled on job details, dashboard & WhatsApp forms
 */
export default function ContactPopupTrigger() {
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();

  const isPopupDisabled = () => {
    // ❌ Job listing & job detail pages
    if (pathname === '/jobs' || pathname.startsWith('/jobs/')) {
      return true;
    }

    // ❌ Dashboard (all admin routes)
    if (pathname.startsWith('/dashboard')) {
      return true;
    }

    // ❌ WhatsApp lead & campaign forms
    if (
      pathname === '/WhatsaapLeads' ||
      pathname.startsWith('/dashboard/whatsaapLeads') ||
      pathname.startsWith('/apply/whatsaap/campaign/forms')
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (isPopupDisabled()) return;
    if (sessionStorage.getItem(POPUP_SESSION_KEY) === 'true') return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
      setShowPopup(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!showPopup) return null;

  return (
    <ContactPopup
      open={showPopup}
      onClose={() => {
        sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
        setShowPopup(false);
      }}
    />
  );
}
