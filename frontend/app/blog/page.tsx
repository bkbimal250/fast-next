import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { blogPosts, blogTopics } from '@/lib/content/blog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

export const metadata: Metadata = {
  title: 'Spa Jobs Career Blog | Workspa',
  description:
    'Career guides, salary insights, interview tips, employer listing help, and city guides for spa therapist, receptionist, beautician, housekeeping, and spa manager jobs.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: 'Spa Jobs Career Blog | Workspa',
    description:
      'Career guides, salary insights, and free listing help for India spa jobs and spa businesses.',
    url: `${siteUrl}/blog`,
    type: 'website',
  },
};

const featuredPost = blogPosts[0];
const latestPosts = blogPosts.slice(1);

const quickLinks = [
  { label: 'Browse latest jobs', href: '/jobs' },
  { label: 'Spa jobs near me', href: '/spa-jobs-near-me' },
  { label: 'SPAs near me', href: '/spa-near-me' },
  { label: 'Free listing enquiry', href: '/free-listing' },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function topicHref(topic: string) {
  const normalized = topic.toLowerCase();

  if (normalized.includes('near me')) return '/spa-jobs-near-me';
  if (normalized.includes('navi mumbai')) return '/spa-jobs-in-navi-mumbai';
  if (normalized.includes('thane')) return '/spa-jobs-in-thane';
  if (normalized.includes('mumbai')) return '/spa-jobs-in-mumbai';
  if (normalized.includes('free') || normalized.includes('shortlist')) return '/free-listing';

  return `/jobs?q=${encodeURIComponent(topic.replace(/guide|career|jobs/gi, '').trim() || topic)}`;
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-8 lg:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Career Guides</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold text-slate-950 sm:text-5xl">
                Practical spa job advice for candidates and verified businesses
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Read guides on spa therapist jobs, receptionist roles, salaries, interviews, part-time work, and free listing follow-up for spa owners.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-lg border border-brand-100 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-800">Most useful right now</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">{featuredPost.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{featuredPost.description}</p>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="mt-5 inline-flex rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Read guide
              </Link>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Latest Articles</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Career and hiring guides</h2>
              </div>
              <Link href="/jobs" className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline">
                View jobs
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {latestPosts.map((post) => (
                <article key={post.slug} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">{post.category}</span>
                    <span className="text-slate-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-slate-950">
                    <Link href={`/blog/${post.slug}`} className="hover:text-brand-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">{formatDate(post.publishedAt)}</span>
                    <Link href={`/blog/${post.slug}`} className="font-semibold text-brand-700 hover:text-brand-800">
                      Read more
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Popular searches</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {blogTopics.slice(0, 12).map((topic) => (
                  <Link
                    key={topic}
                    href={topicHref(topic)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">For spa owners</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Want to list your spa or shop and post jobs after verification? Send your details and our team will follow up.
              </p>
              <Link
                href="/free-listing"
                className="mt-4 inline-flex w-full justify-center rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-600"
              >
                Send free listing enquiry
              </Link>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
