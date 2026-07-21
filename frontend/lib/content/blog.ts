export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: string;
  relatedLinks: Array<{ label: string; href: string }>;
  sections: Array<{ heading: string; body: string }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'spa-therapist-jobs-in-mumbai',
    title: 'Spa Therapist Jobs in Mumbai: Salary, Skills, and How to Apply',
    description:
      'A practical guide for finding spa therapist jobs in Mumbai, including salary range, skills, documents, and application tips.',
    category: 'Career Guide',
    tags: ['Spa Therapist', 'Mumbai', 'Salary'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-20',
    readTime: '5 min read',
    relatedLinks: [
      { label: 'Spa therapist jobs', href: '/jobs?q=spa%20therapist' },
      { label: 'Jobs in Mumbai', href: '/spa-jobs-in-mumbai' },
      { label: 'Apply for latest jobs', href: '/jobs' },
    ],
    sections: [
      {
        heading: 'What employers look for',
        body:
          'Most spas prefer candidates who are punctual, well-groomed, comfortable speaking with customers, and trained in common therapies such as Swedish, deep tissue, aromatherapy, and foot reflexology.',
      },
      {
        heading: 'Expected salary',
        body:
          'Entry-level spa therapist roles commonly start with a fixed monthly salary plus incentives or tips. Experienced therapists can earn more in premium locations such as Bandra, Andheri, Powai, Navi Mumbai, and Thane.',
      },
      {
        heading: 'How to apply faster',
        body:
          'Keep your phone number active, mention your experience clearly, and apply to jobs near your preferred travel route. Shortlisting is faster when the profile has location, timing, skills, and expected salary.',
      },
    ],
  },
  {
    slug: 'how-to-apply-for-spa-jobs',
    title: 'How to Apply for Spa Jobs in India',
    description:
      'Step-by-step application tips for spa therapist, receptionist, beautician, housekeeping, and spa manager jobs.',
    category: 'Application Tips',
    tags: ['Apply', 'Spa Jobs', 'India'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-22',
    readTime: '4 min read',
    relatedLinks: [
      { label: 'All spa jobs', href: '/jobs' },
      { label: 'Spa jobs near me', href: '/spa-jobs-near-me' },
      { label: 'Contact Workspa', href: '/contact' },
    ],
    sections: [
      {
        heading: 'Prepare your details',
        body:
          'Before applying, keep your name, phone number, city, experience, preferred role, expected salary, and joining availability ready.',
      },
      {
        heading: 'Choose relevant roles',
        body:
          'Apply for jobs that match your skills. Therapist, receptionist, beautician, manager, and housekeeping roles have different expectations and interview questions.',
      },
      {
        heading: 'Follow up professionally',
        body:
          'If a job has call or WhatsApp options, send a short message with your experience, location, and preferred interview time.',
      },
    ],
  },
  {
    slug: 'spa-job-salary-in-india',
    title: 'Spa Job Salary in India by Role and Experience',
    description:
      'Understand salary expectations for spa therapist, receptionist, manager, beautician, and housekeeping jobs in India.',
    category: 'Salary Guide',
    tags: ['Salary', 'India', 'Career'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-24',
    readTime: '5 min read',
    relatedLinks: [
      { label: 'Spa manager jobs', href: '/jobs?q=spa%20manager' },
      { label: 'Receptionist jobs', href: '/jobs?q=receptionist' },
      { label: 'Beautician jobs', href: '/jobs?q=beautician' },
    ],
    sections: [
      {
        heading: 'Salary depends on role',
        body:
          'Therapists and beauticians are usually paid based on skill depth, treatment experience, and customer handling. Managers are evaluated more on team, revenue, and operations.',
      },
      {
        heading: 'Location matters',
        body:
          'Premium city areas and high-traffic spa centers often pay better because customer volume and service pricing are higher.',
      },
      {
        heading: 'Growth path',
        body:
          'Candidates can grow from therapist or receptionist roles into senior therapist, trainer, supervisor, and spa manager positions.',
      },
    ],
  },
  {
    slug: 'spa-receptionist-job-responsibilities',
    title: 'Spa Receptionist Job Responsibilities: Skills, Salary, and Interview Tips',
    description:
      'Learn what spa receptionist jobs require, how to prepare for interviews, and what employers check before hiring.',
    category: 'Role Guide',
    tags: ['Receptionist', 'Front Desk', 'Interview'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-26',
    readTime: '4 min read',
    relatedLinks: [
      { label: 'Receptionist jobs', href: '/jobs?q=receptionist' },
      { label: 'Jobs near me', href: '/spa-jobs-near-me' },
      { label: 'Apply now', href: '/jobs' },
    ],
    sections: [
      {
        heading: 'Main duties',
        body:
          'Receptionists handle calls, bookings, walk-in customers, billing coordination, appointment reminders, and daily front desk communication.',
      },
      {
        heading: 'Skills employers prefer',
        body:
          'Clear speaking, basic computer use, polite customer handling, timing discipline, and confidence with WhatsApp or phone follow-ups are useful in most spas.',
      },
      {
        heading: 'Interview preparation',
        body:
          'Prepare answers about customer handling, shift timing, previous front desk experience, languages known, and how quickly you can join.',
      },
    ],
  },
  {
    slug: 'part-time-spa-jobs-near-me',
    title: 'Part-Time Spa Jobs Near Me: How to Find Flexible Spa Work',
    description:
      'A simple guide for finding part-time spa jobs near your location with practical filters, timing tips, and application advice.',
    category: 'Job Search',
    tags: ['Part Time', 'Near Me', 'Flexible Jobs'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-28',
    readTime: '4 min read',
    relatedLinks: [
      { label: 'Part-time jobs', href: '/jobs?job_type=part-time' },
      { label: 'Jobs near me', href: '/spa-jobs-near-me' },
      { label: 'All jobs', href: '/jobs' },
    ],
    sections: [
      {
        heading: 'Use location first',
        body:
          'Part-time work is easier when travel is short. Search by city, area, or near-me filters before comparing salary or incentives.',
      },
      {
        heading: 'Mention available hours',
        body:
          'Employers shortlist faster when candidates mention morning, evening, weekend, or fixed-hour availability clearly.',
      },
      {
        heading: 'Check payment details',
        body:
          'Ask whether payment is hourly, per shift, fixed monthly, commission-based, or a mix of salary and incentives.',
      },
    ],
  },
  {
    slug: 'free-listing-for-spa-businesses',
    title: 'Free Listing for Spa Businesses: How Workspa Follow-Up Works',
    description:
      'For spa owners and recruiters: learn how free listing enquiries are verified before business credentials are shared.',
    category: 'For Employers',
    tags: ['Free Listing', 'Recruiters', 'Spa Business'],
    author: 'Workspa Editorial',
    publishedAt: '2026-01-30',
    readTime: '3 min read',
    relatedLinks: [
      { label: 'Send free listing enquiry', href: '/free-listing' },
      { label: 'Login', href: '/login' },
      { label: 'Contact Workspa', href: '/contact' },
    ],
    sections: [
      {
        heading: 'Send business details',
        body:
          'Share the contact name, phone, email, spa or shop name, city, address, and any website or social profile that helps verify the business.',
      },
      {
        heading: 'Verification and follow-up',
        body:
          'The Workspa team reviews the enquiry, contacts the business, confirms listing details, and checks whether the business is suitable for recruiter access.',
      },
      {
        heading: 'Credentials after verification',
        body:
          'After successful verification, credentials can be shared so the recruiter can manage their own business listing and post jobs against that business.',
      },
    ],
  },
];

export const blogTopics = [
  'Spa therapist jobs in Mumbai',
  'How to apply for spa jobs',
  'Spa job salary in India',
  'Spa receptionist job responsibilities',
  'Best cities for spa jobs',
  'Spa manager career guide',
  'Beautician jobs in wellness centers',
  'Housekeeping jobs in spas',
  'Interview questions for spa therapist jobs',
  'How to write a spa job profile',
  'Part-time spa jobs near me',
  'Female spa therapist career guide',
  'Spa jobs in Navi Mumbai',
  'Spa jobs in Thane',
  'Skills required for massage therapist jobs',
  'How spas shortlist candidates',
  'Documents needed for spa jobs',
  'Freshers guide to spa careers',
  'How to negotiate spa job salary',
  'Career growth in the wellness industry',
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
