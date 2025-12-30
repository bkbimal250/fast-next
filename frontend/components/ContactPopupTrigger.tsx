'use client';

import { useEffect, useState } from 'react';
import ContactPopup from '@/app/Popup/ContactPopup';

/**
 * Component that triggers the contact popup after 15 seconds of visiting the website
 * Uses localStorage to remember if user has dismissed it (optional - can be removed if you want it to show every time)
 */
export default function ContactPopupTrigger() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has been shown before (optional - remove if you want it to show every visit)
    const popupShown = localStorage.getItem('contactPopupShown');
    
    if (popupShown === 'true') {
      setHasShown(true);
      return;
    }

    // Set timer to show popup after 15 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
      // Mark as shown in localStorage (optional)
      localStorage.setItem('contactPopupShown', 'true');
    }, 15000); // 15 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  // Don't render if already shown or if not time yet
  if (hasShown || !showPopup) {
    return null;
  }

  return <ContactPopup open={showPopup} onClose={handleClose} />;
}

