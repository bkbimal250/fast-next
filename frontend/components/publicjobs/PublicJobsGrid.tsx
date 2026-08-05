'use client';

import PublicJobCard from './PublicJobCard';
import { Job } from '@/lib/job';

type PublicJobsGridProps = {
  jobs: Job[];
};

export default function PublicJobsGrid({ jobs }: PublicJobsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {jobs.map((job) => (
        <PublicJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
