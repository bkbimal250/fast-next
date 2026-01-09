import type { Metadata } from 'next';
import { generateJobMetadata } from './metadata';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

interface JobDetailLayoutProps {
  children: React.ReactNode;
  params: { 'job-slug': string };
}

export async function generateMetadata({
  params,
}: {
  params: { 'job-slug': string };
}): Promise<Metadata> {
  try {
    // Fetch job data server-side for metadata generation
    const jobResponse = await fetch(`${apiUrl}/api/jobs/slug/${params['job-slug']}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (!jobResponse.ok) {
      // Return fallback metadata if job not found
      return {
        title: 'Job Not Found | Work Spa Portal',
        description: 'The job you are looking for could not be found.',
      };
    }

    const job = await jobResponse.json();

    // Fetch SPA details if spa_id exists
    let spa = null;
    if (job.spa_id) {
      try {
        const spaResponse = await fetch(`${apiUrl}/api/spas/${job.spa_id}`, {
          cache: 'no-store',
        });
        if (spaResponse.ok) {
          spa = await spaResponse.json();
        }
      } catch (error) {
        // If SPA fetch fails, continue without SPA details
        console.error('Failed to fetch SPA details for metadata:', error);
      }
    }

    // Use generateJobMetadata which automatically includes location in title and description
    return generateJobMetadata(job, spa);
  } catch (error) {
    console.error('Error generating job metadata:', error);
    // Return fallback metadata on error
    return {
      title: 'SPA Job Details | Work Spa Portal',
      description: 'View detailed information about this spa job opportunity.',
    };
  }
}

export default function JobDetailLayout({
  children,
}: JobDetailLayoutProps) {
  return <>{children}</>;
}

