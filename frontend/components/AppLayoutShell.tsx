'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';

const ChatWidget = dynamic(() => import('@/components/Chatbot/ChatWidget'), {
  ssr: false,
});

const ContactPopupTrigger = dynamic(() => import('@/components/ContactPopupTrigger'), {
  ssr: false,
});

interface AppLayoutShellProps {
  children: React.ReactNode;
}

export default function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const [showEnhancements, setShowEnhancements] = useState(false);
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const hidePublicChrome = isDashboard || isAuthPage;

  useEffect(() => {
    if (hidePublicChrome) {
      setShowEnhancements(false);
      return;
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idleId = win.requestIdleCallback
      ? win.requestIdleCallback(() => setShowEnhancements(true))
      : window.setTimeout(() => setShowEnhancements(true), 2500);

    return () => {
      if (win.cancelIdleCallback) {
        win.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [hidePublicChrome]);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        {!hidePublicChrome && <Footer />}
      </div>

      {!hidePublicChrome && showEnhancements && (
        <>
          <ChatWidget />
          <ContactPopupTrigger />
        </>
      )}
    </>
  );
}
