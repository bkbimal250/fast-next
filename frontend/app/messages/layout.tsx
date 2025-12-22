import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Messages',
  'View and manage your job inquiry messages.',
  {
    keywords: ['messages', 'job inquiries'],
    noindex: true, // Messages pages should not be indexed
  }
);

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

