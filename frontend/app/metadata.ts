import type { Metadata } from 'next';
import { defaultMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Spa Jobs Near Me - Find Spa Jobs in Your City | Workspa',
  description: 'Find verified spa jobs near you. Apply directly to spas without login. Browse spa jobs by location, salary, and experience for therapist, receptionist, beautician, and spa manager roles.',
  openGraph: {
    ...defaultMetadata.openGraph,
    title: 'Spa Jobs Near Me - Find Spa Jobs in Your City',
    description: 'Find verified spa jobs near you. Apply directly to spas without login. Browse spa jobs by location, salary, and experience.',
  },
};

