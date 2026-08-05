'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/Chatbot/ChatWidget';
import ContactPopupTrigger from '@/components/ContactPopupTrigger';

interface AppLayoutShellProps {
  children: React.ReactNode;
}

export default function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const hidePublicChrome = isDashboard || isAuthPage;

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        {!hidePublicChrome && <Footer />}
      </div>

      {!hidePublicChrome && (
        <>
          <ChatWidget />
          <ContactPopupTrigger />
        </>
      )}
    </>
  );
}
