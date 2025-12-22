import type { Metadata } from 'next';
import { defaultMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'SPA Jobs Near Me - Find Spa Jobs in Your City | SPA Jobs Portal',
  description: 'Find the best spa jobs near you. Apply directly to spas without login. Browse thousands of spa jobs by location, salary, and experience. Search for therapist, masseuse, and spa manager positions.',
  openGraph: {
    ...defaultMetadata.openGraph,
    title: 'SPA Jobs Near Me - Find Spa Jobs in Your City',
    description: 'Find the best spa jobs near you. Apply directly to spas without login. Browse thousands of spa jobs by location, salary, and experience.',
  },
};

