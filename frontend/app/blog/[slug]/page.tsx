import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { blogPosts, getBlogPost } from '@/lib/content/blog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    title: `${post.title} | Workspa`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BlogDetailPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  const fallbackRelatedPosts = relatedPosts.length > 0
    ? relatedPosts
    : blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  const url = `${siteUrl}/blog/${post.slug}`;
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Workspa' },
    mainEntityOfPage: url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="hover:text-brand-700">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-brand-700">Blog</Link>
              <span>/</span>
              <span className="text-slate-700">{post.category}</span>
            </nav>

            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="max-w-4xl text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{post.description}</p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>{post.author}</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-8">
              {post.sections.map((section, index) => (
                <section key={section.heading}>
                  <p className="text-sm font-semibold text-brand-700">Step {index + 1}</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">{section.heading}</h2>
                  <p className="mt-3 text-base leading-8 text-slate-700">{section.body}</p>
                </section>
              ))}
            </div>

            <section className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-bold text-slate-950">Useful links</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Next action</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ready to search now? Use Workspa job filters for role, city, area, salary, and timing.
              </p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex w-full justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Browse jobs
              </Link>
              <Link
                href="/free-listing"
                className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-brand-300 hover:text-brand-700"
              >
                Free listing enquiry
              </Link>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Related guides</h2>
              <div className="mt-4 space-y-4">
                {fallbackRelatedPosts.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="block rounded-lg border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{item.category}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{item.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
