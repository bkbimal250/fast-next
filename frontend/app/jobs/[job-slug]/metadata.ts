import { Metadata } from 'next'
import { Job } from '@/lib/job'
import { Spa } from '@/lib/spa'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'

export function generateJobMetadata(job: Job, spa?: Spa | null): Metadata {
  const locationParts = []
  if (job.area?.name) locationParts.push(job.area.name)
  if (job.city?.name) locationParts.push(job.city.name)
  if (job.state?.name) locationParts.push(job.state.name)
  const location = locationParts.join(', ') || 'India'

  const title = `${job.title} at ${spa?.name || 'SPA'} - ${location} | SPA Jobs Portal`
  const description = job.description 
    ? `${job.description.substring(0, 155)}...` 
    : `Apply for ${job.title} position at ${spa?.name || 'SPA'} in ${location}. ${job.salary_min && job.salary_max ? `Salary: ₹${job.salary_min/1000}k - ₹${job.salary_max/1000}k PA.` : ''}`

  const jobUrl = `${siteUrl}/jobs/${job.slug}`
  const ogImage = spa?.logo_image 
    ? `${process.env.NEXT_PUBLIC_API_URL https://spajob.api.spajob.spajobs.co.in}/${spa.logo_image}`
    : `${siteUrl}/og-image.jpg`

  return {
    title,
    description,
    keywords: [
      job.title,
      `${job.title} jobs`,
      `${job.title} ${location}`,
      spa?.name || 'SPA',
      'spa jobs',
      'spa therapist jobs',
      location,
      job.job_type?.name || '',
      job.job_category?.name || '',
    ].filter(Boolean),
    openGraph: {
      type: 'article',
      url: jobUrl,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${job.title} at ${spa?.name || 'SPA'}`,
        },
      ],
      siteName: 'Workspa - SPA Jobs Portal',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: jobUrl,
    },
  }
}

