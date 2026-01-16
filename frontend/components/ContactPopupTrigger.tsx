'use client';

import { useEffect, useState } from 'react';
import ContactPopup from '@/app/Popup/ContactPopup';

/**
 * Component that triggers the contact popup after 10 seconds of visiting the website
 * Shows on every page refresh/visit
 */
export default function ContactPopupTrigger() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Set timer to show popup after 10 seconds on every page load/refresh
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 10000); // 10 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  // Don't render if not time yet
  if (!showPopup) {
    return null;
  }

  return <ContactPopup open={showPopup} onClose={handleClose} />;
}

