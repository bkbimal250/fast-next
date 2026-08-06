'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { jobAPI, Job } from '@/lib/job';
import { parseLocationSlugSmart } from '@/lib/location-utils';
import axios from 'axios';
import Link from 'next/link';
import {
    FaArrowRight,
    FaBriefcase,
    FaBuilding,
    FaChartLine,
    FaCheckCircle,
    FaClock,
    FaMapMarkerAlt,
    FaSearch,
    FaShieldAlt,
    FaUsers,
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const roleLinks = [
    { label: 'Spa Therapist', slug: 'spa-therapist', icon: FaUsers },
    { label: 'Receptionist', slug: 'receptionist', icon: FaBuilding },
    { label: 'Spa Manager', slug: 'spa-manager', icon: FaBriefcase },
    { label: 'Beautician', slug: 'beautician', icon: FaCheckCircle },
];

export default function CityClient({ params }: { params: { city: string } }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobCount, setJobCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [cityName, setCityName] = useState<string>('');
    const [categories, setCategories] = useState<Array<{ name: string; slug: string; count: number }>>([]);

    useEffect(() => {
        if (params.city) {
            fetchCityData();
            fetchJobs();
            fetchJobCount();
            fetchCategories();
        }
    }, [params.city]);

    const fetchCityData = async () => {
        try {
            const parsed = await parseLocationSlugSmart(params.city);
            setCityName(parsed.city || params.city.replace(/-/g, ' '));
        } catch (err) {
            setCityName(params.city.replace(/-/g, ' '));
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const parsed = await parseLocationSlugSmart(params.city);
            const params_query: any = { limit: 24 };
            if (parsed.cityId) params_query.city_id = parsed.cityId;

            const data = await jobAPI.getAllJobs(params_query);
            const activeJobs = data.filter((job: Job) => job.is_active);
            setJobs(activeJobs);
            setCategories(buildCategories(activeJobs));
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobCount = async () => {
        try {
            const parsed = await parseLocationSlugSmart(params.city);
            const params_query: any = {};
            if (parsed.cityId) params_query.city_id = parsed.cityId;

            const response = await axios.get(`${API_URL}/api/jobs/count`, { params: params_query });
            setJobCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching job count:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/jobs/counts-by-location`);
            const cityData = response.data.find((item: any) => item.city_slug === params.city);

            if (cityData) {
                setCategories((current) => current.length > 0 ? current : [
                    { name: 'Spa Therapist', slug: 'spa-therapist', count: cityData.job_count },
                    { name: 'Receptionist', slug: 'receptionist', count: cityData.job_count },
                    { name: 'Spa Manager', slug: 'spa-manager', count: cityData.job_count },
                    { name: 'Beautician', slug: 'beautician', count: cityData.job_count },
                ]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const buildCategories = (jobList: Job[]) => {
        const counts = new Map<string, { name: string; slug: string; count: number }>();

        jobList.forEach((job) => {
            const categoryName =
                typeof job.job_category === 'string'
                    ? job.job_category
                    : job.job_category?.name;
            if (!categoryName) return;
            const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const existing = counts.get(slug);
            counts.set(slug, {
                name: categoryName,
                slug,
                count: (existing?.count || 0) + 1,
            });
        });

        const categoryList = Array.from(counts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        return categoryList.length > 0 ? categoryList : [];
    };

    const displayCityName = cityName || params.city.replace(/-/g, ' ');
    const featuredJobs = jobs.filter((job) => job.is_featured).length;
    const hiringSpas = new Set(jobs.map((job) => job.spa_id).filter(Boolean)).size;
    const roleCount = new Set(
        jobs
            .map((job) => typeof job.job_category === 'string' ? job.job_category : job.job_category?.name)
            .filter(Boolean)
    ).size;
    const topAreas = Array.from(
        jobs.reduce((map, job) => {
            const areaName = job.area?.name;
            if (!areaName) return map;
            map.set(areaName, (map.get(areaName) || 0) + 1);
            return map;
        }, new Map<string, number>())
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
    const pageUrl = `${siteUrl}/cities/${params.city}`;

    // Helper function to normalize employment type
    const normalizeEmploymentType = (type: string): string => {
        const normalized = type?.toUpperCase().trim() || 'FULL_TIME';
        const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'];
        const typeMap: Record<string, string> = {
            'FULL TIME': 'FULL_TIME', 'PART TIME': 'PART_TIME', 'FULLTIME': 'FULL_TIME', 'PARTTIME': 'PART_TIME',
            'FULL-TIME': 'FULL_TIME', 'PART-TIME': 'PART_TIME',
        };
        const mapped = typeMap[normalized] || normalized;
        return validTypes.includes(mapped) ? mapped : 'FULL_TIME';
    };

    const collectionPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Spa Jobs in ${displayCityName}`,
        description: `Find ${jobCount}+ spa jobs in ${displayCityName}. Browse spa therapist, receptionist, beautician, and spa manager positions.`,
        url: pageUrl,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: jobCount,
            itemListElement: jobs.slice(0, 10).map((job, index) => {
                const logoUrl = job.spa?.logo_image
                    ? `${API_URL}${job.spa.logo_image.startsWith('/') ? job.spa.logo_image : `/${job.spa.logo_image}`}`
                    : undefined;

                return {
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'JobPosting',
                        title: job.title,
                        description: job.description?.substring(0, 200) || '',
                        identifier: {
                            '@type': 'PropertyValue',
                            name: job.spa?.name || 'SPA',
                            value: job.id.toString(),
                        },
                        datePosted: job.created_at,
                        validThrough: (job as any).expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                        employmentType: normalizeEmploymentType((job as any).Employee_type || 'FULL_TIME'),
                        hiringOrganization: {
                            '@type': 'Organization',
                            name: job.spa?.name || 'SPA',
                            ...(logoUrl && { logo: logoUrl }),
                            ...(job.spa?.slug && { sameAs: `${siteUrl}/besttopspas/${job.spa.slug}` }),
                        },
                        jobLocation: {
                            '@type': 'Place',
                            address: {
                                '@type': 'PostalAddress',
                                ...(job.spa?.address && { streetAddress: job.spa.address }),
                                addressLocality: job.city?.name || displayCityName,
                                ...(job.state?.name && { addressRegion: job.state.name }),
                                ...(job.postalCode && { postalCode: job.postalCode }),
                                addressCountry: job.country?.name || 'IN',
                            },
                        },
                        ...(job.salary_min && {
                            estimatedSalary: {
                                "@type": "MonetaryAmount",
                                currency: job.salary_currency || "INR",
                                value: {
                                    "@type": "QuantitativeValue",
                                    minValue: Number(job.salary_min),
                                    ...(job.salary_max && { maxValue: Number(job.salary_max) }),
                                    unitText: "YEAR",
                                },
                            },
                        }),
                    },
                };
            }),
        },
    };

    const faqSchema = {
        "@context": "https://Schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: `How can I find spa jobs in ${displayCityName}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: `You can browse the latest spa jobs in ${displayCityName} on Workspa.in. We offer positions for therapists, receptionists, beauticians, and managers.`
                }
            },
            {
                "@type": "Question",
                name: `Are there high paying spa jobs in ${displayCityName}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: `Yes, many spas in ${displayCityName} offer competitive salaries. Check listings by role, area, timing, and experience before applying.`
                }
            }
        ]
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Jobs',
                item: `${siteUrl}/jobs`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: `Jobs in ${displayCityName}`,
                item: pageUrl,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-surface-light">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-brand-900 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_32%),linear-gradient(135deg,_rgba(15,118,110,0.95),_rgba(15,23,42,0.96))]" />
                <div className="page-shell relative py-10 sm:py-14 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white sm:text-sm">
                                    <FaShieldAlt size={13} />
                                    Verified spa hiring
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white sm:text-sm">
                                    <FaMapMarkerAlt size={13} />
                                    {displayCityName}
                                </span>
                            </div>

                            <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                                Spa jobs in {displayCityName}
                            </h1>
                            <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
                                Browse therapist, receptionist, beautician, housekeeping, and spa manager jobs from active spa businesses in {displayCityName}.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={`/jobs?location=${encodeURIComponent(displayCityName)}`} className="btn-primary">
                                    Search jobs in {displayCityName}
                                </Link>
                                <Link
                                    href="/free-listing"
                                    className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                                >
                                    Add free listing
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Open jobs', value: jobCount || jobs.length, icon: FaBriefcase },
                                    { label: 'Hiring spas', value: hiringSpas || '-', icon: FaBuilding },
                                    { label: 'Featured jobs', value: featuredJobs, icon: FaChartLine },
                                    { label: 'Role types', value: roleCount || '-', icon: FaUsers },
                                ].map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.label} className="rounded-lg bg-white p-4 text-slate-950">
                                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                                                <Icon size={16} />
                                            </div>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                            <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main>
                <section className="border-b border-slate-200 bg-white">
                    <div className="page-shell py-5">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            {roleLinks.map((role) => {
                                const Icon = role.icon;
                                const count = categories.find((category) => category.slug.includes(role.slug) || role.slug.includes(category.slug))?.count;
                                return (
                                    <Link
                                        key={role.slug}
                                        href={`/jobs/${role.slug}-jobs-in-${params.city}`}
                                        className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
                                                <Icon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="font-bold text-slate-950 group-hover:text-brand-700">
                                                    {role.label} Jobs
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {count ? `${count}+ active openings` : `Search in ${displayCityName}`}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="page-shell py-6">
                    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                                <FaSearch size={12} />
                                City job guide
                            </div>
                            <h2 className="text-2xl font-bold text-slate-950">Find spa jobs in {displayCityName}</h2>
                            <p className="mt-3 leading-7 text-slate-700">
                                Workspa lists active spa therapist, receptionist, beautician, housekeeping, and spa manager jobs in {displayCityName}.
                                Compare openings by area, salary, timing, experience, and employer details before applying.
                            </p>
                            {topAreas.length > 0 && (
                                <div className="mt-5">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Top hiring areas</h3>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {topAreas.map(([area, count]) => (
                                            <Link
                                                key={area}
                                                href={`/jobs?location=${encodeURIComponent(`${area} ${displayCityName}`)}`}
                                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                                            >
                                                {area} ({count})
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-950">Popular searches</h3>
                            <div className="mt-4 space-y-2">
                                {roleLinks.slice(0, 4).map((role) => (
                                    <Link
                                        key={role.slug}
                                        href={`/jobs/${role.slug}-jobs-in-${params.city}`}
                                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                                    >
                                        {role.label} jobs
                                        <FaArrowRight size={12} />
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    </div>
                </section>

            <section className="page-shell pb-10">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Latest openings</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                            Active spa jobs in {displayCityName}
                        </h2>
                    </div>
                    {jobs.length > 0 && (
                        <Link href={`/jobs?location=${encodeURIComponent(displayCityName)}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800">
                            View all city jobs
                            <FaArrowRight size={12} />
                        </Link>
                    )}
                </div>
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-5">
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-slate-200"></div>
                                    <div className="flex-1">
                                        <div className="mb-3 h-5 w-3/4 rounded bg-slate-200"></div>
                                        <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 rounded bg-slate-200"></div>
                                    <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                            <FaBriefcase size={26} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-950">No jobs found in {displayCityName}</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            Try another nearby city, search all jobs, or add your business so candidates can find you.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            <Link href="/jobs" className="btn-primary">Browse all jobs</Link>
                            <Link href="/free-listing" className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700">
                                Add free listing
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                id={job.id}
                                title={job.title}
                                slug={job.slug}
                                spaName={job.spa?.name}
                                spaAddress={job.spa?.address}
                                location={[job.area?.name, job.city?.name].filter(Boolean).join(', ') || 'Location not specified'}
                                salaryMin={job.salary_min}
                                salaryMax={job.salary_max}
                                salaryCurrency={job.salary_currency}
                                experienceMin={job.experience_years_min}
                                experienceMax={job.experience_years_max}
                                jobType={typeof job.job_type === 'string' ? job.job_type : job.job_type?.name}
                                jobCategory={typeof job.job_category === 'string' ? job.job_category : job.job_category?.name}
                                logoImage={job.spa?.logo_image}
                                created_at={job.created_at}
                                description={job.description}
                                hr_contact_phone={job.hr_contact_phone}
                                required_gender={job.required_gender}
                                job_timing={job.job_timing}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="border-t border-slate-200 bg-white">
                <div className="page-shell py-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            { title: 'Verified employers', text: 'Browse jobs connected with spa business listings and profile details.', icon: FaShieldAlt },
                            { title: 'Fresh city roles', text: 'Find openings by role, area, salary range, timing, and experience.', icon: FaClock },
                            { title: 'Quick apply flow', text: 'Open any job card, review details, and apply from the job detail page.', icon: FaCheckCircle },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                                        <Icon size={16} />
                                    </div>
                                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </main>
        </div>
    );
}
