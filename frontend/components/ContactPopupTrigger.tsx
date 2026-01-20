'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ContactPopup from '@/app/Popup/ContactPopup';

/**
 * Component that triggers the contact popup after 10 seconds of visiting the website
 * Shows on every page refresh/visit
 */
export default function ContactPopupTrigger() {
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();

  // List of paths where popup should be disabled
  const disabledPaths = [
    '/apply/whatsaap/campaign/forms',
    '/WhatsaapLeads' // Also disable for the public form we created earlier if needed, but user specifically asked for the campaign form
  ];

  useEffect(() => {
    // Don't show on disabled paths
    if (disabledPaths.includes(pathname)) {
      return;
    }

    // Set timer to show popup after 10 seconds on every page load/refresh
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 10000); // 10 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setShowPopup(false);
  };

  // Don't render if not time yet
  if (!showPopup) {
    return null;
  }

  return <ContactPopup open={showPopup} onClose={handleClose} />;
}

