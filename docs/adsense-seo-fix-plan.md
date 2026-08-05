# Workspa AdSense and SEO Fix Plan

Audit date: 2026-07-21

Status legend: unchecked items are not implemented yet.

## Phase 1 — Critical Approval Blockers

| Status | Task | Reason | Files affected | Backend changes | Frontend changes | Database migration required | Risk | Test method |
|---|---|---|---|---|---|---|---|---|
| [ ] | Add full job moderation workflow | Prevent unsafe, adult, fake, discriminatory, or unverified jobs from publishing. | `backend/app/modules/jobs/*`, dashboard job pages | Add `moderation_status`, `rejection_reason`, `approved_at`, `approved_by`, `suspended_at`, `suspension_reason`; default recruiter jobs to pending. | Add dashboard review queue, status badges, approval/reject/unpublish actions. | Yes | High | Create recruiter job; confirm it is not public/sitemap/schema until approved. |
| [ ] | Add blocked keyword detection for spa/adult-risk wording | Spa content is a high policy-risk category for AdSense. | `backend/app/modules/jobs/services.py`, job create/edit pages | Validate title/description/requirements for blocked and review keywords; log matches. | Show clear moderation warning to admins/managers/recruiters. | Optional | High | Submit test words such as escort/special service/intimate massage and confirm pending/rejected behavior. |
| [ ] | Add Report Job and Report Employer | Allows users to flag unsafe or fake listings. | New `backend/app/modules/reports`, `frontend/components/job-detail/*`, spa profile pages | Create report model/routes, admin queue, status handling. | Add buttons on job detail and employer profile pages. | Yes | High | Submit report publicly; verify admin can review and unpublish. |
| [ ] | Fix public job slug endpoint for inactive/expired jobs | Inactive or expired jobs must not appear active or carry JobPosting schema. | `backend/app/modules/jobs/services.py`, `backend/app/modules/jobs/routes.py`, `frontend/app/jobs/[job-slug]/*` | Public slug endpoint filters active, approved, unexpired; separate admin endpoint can fetch inactive. | Show expired state with related active jobs or 404/410. | No | High | Request inactive/expired slug; confirm no active schema and correct status/page. |
| [ ] | Server-render `/jobs` initial listing | Google and AdSense need meaningful content in initial HTML. | `frontend/app/jobs/page.tsx`, `frontend/lib/job.ts`, API routes | Ensure API supports server fetch with pagination/count. | Convert first-page listing to SSR/Server Component with client filters layered on top. | No | High | View page source/curl; confirm job title, spa, city, salary, date, URL appear. |
| [ ] | Server-render job detail visible content | JobPosting schema should match visible content and be crawlable. | `frontend/app/jobs/[job-slug]/page.tsx`, `frontend/app/jobs/[job-slug]/layout.tsx` | Public API returns only safe job detail data. | Move job fetch/render to server page; keep actions client-only. | No | High | View page source/curl for a job URL; confirm complete job content. |
| [ ] | Remove or database-back public statistics | Unsupported hardcoded claims harm trust and AdSense approval. | `frontend/app/page.tsx`, `frontend/app/about/page.tsx`, `frontend/components/StatsSection.tsx`, `frontend/components/Areasjobs.tsx` | Add public stats endpoint or reuse analytics counts safely. | Replace `1000+`, `500+`, `50+`, `24/7` with real counts or remove. | No | Medium | Compare displayed counts to DB/API values. |
| [ ] | Lock down backend docs in production | Public `/docs` and `/redoc` expose API surface. | `backend/app/main.py`, deployment env | Enable docs only in DEBUG/internal mode. | None. | No | Medium | Production `/docs` returns 404 or is protected. |
| [ ] | Add rate limiting and abuse prevention to public forms | Contact, free listing, forgot password, applications can be spammed. | `backend/app/core/rate_limit.py`, public form routes | Enable rate limit middleware; add endpoint-specific limits. | Add friendly rate-limit error states. | Optional if Redis used | High | Rapid-submit forms; confirm 429 behavior. |

## Phase 2 — SEO and Content Quality

| Status | Task | Reason | Files affected | Backend changes | Frontend changes | Database migration required | Risk | Test method |
|---|---|---|---|---|---|---|---|---|
| [ ] | Consolidate JobPosting schema into one source | Avoid duplicate/mismatched salary, expiry, and organization data. | `frontend/lib/job-schema.ts`, `frontend/app/jobs/[job-slug]/page.tsx`, `frontend/app/jobs/[job-slug]/layout.tsx` | None. | Remove client schema object; use server schema only for approved active jobs. | No | Medium | Rich Results Test on sample URLs. |
| [ ] | Correct salary period and visible/schema match | Google requires structured data to match visible content. | `frontend/lib/job-schema.ts`, job detail components | Add salary period field if needed. | Display the same period used in schema. | Optional | Medium | Compare rendered salary with JSON-LD. |
| [ ] | Clean indexing for auth/query/no-results pages | Avoid indexing low-value or private pages. | `frontend/app/login/layout.tsx`, `frontend/app/register/layout.tsx`, forgot/reset layouts, `frontend/app/jobs/page.tsx`, `frontend/app/robots.ts` | None. | Add `noindex, follow`; canonical filters to `/jobs`; noindex no-results pages. | No | Medium | Inspect HTML robots meta and canonical. |
| [ ] | Improve sitemap filters | Sitemap should include only canonical, useful, active, approved, unexpired pages. | `frontend/app/sitemap.xml/route.ts`, `backend/app/modules/seo/sitemap.py`, `backend/app/modules/seo/routes.py` | Filter sitemap data by approval/expiry/verification and job count thresholds. | Remove questionable generated URL patterns. | No | Medium | Crawl sitemap URLs; confirm 200/indexable only. |
| [ ] | Add city/area page quality thresholds | Avoid doorway/thin pages. | `frontend/app/cities/*`, `frontend/app/spa-jobs-in*`, backend SEO data | Provide counts and location data. | Add noindex for zero/low content; add salary, roles, areas, safety, FAQ content for quality pages. | No | Medium | Test empty and populated city pages. |
| [ ] | Expand selected blog guides manually | Improve AdSense and SEO quality without mass generation. | `frontend/lib/content/blog.ts`, `frontend/app/blog/*` | None. | Add author profile, updated date, examples, salary methodology, internal links. | No | Low | Review article usefulness and metadata. |
| [ ] | Add global/error page | Better UX and crawl handling. | `frontend/app/error.tsx`, job detail server routes | None. | Add global error UI; server 404 for missing jobs. | No | Low | Trigger missing/error routes. |
| [ ] | Run production crawl and fix broken links | Catch route mismatch, redirects, 404s, broken images. | Whole frontend | None unless API routes fail. | Fix broken links/images/canonicals. | No | Medium | Use crawler and inspect status codes. |

## Phase 3 — Trust and Moderation

| Status | Task | Reason | Files affected | Backend changes | Frontend changes | Database migration required | Risk | Test method |
|---|---|---|---|---|---|---|---|---|
| [ ] | Centralize verified business contact details | Trust pages must be consistent. | `frontend/components/Footer.tsx`, `frontend/app/contact/page.tsx`, `frontend/app/privacy/page.tsx`, `frontend/app/terms/page.tsx`, config file | None or add public settings endpoint. | Replace mixed Gmail/domain emails, placeholder tel links, and vague address with verified details. | No | Medium | Compare all public pages for same phone/email/address. |
| [ ] | Add candidate safety page/section | Spa job seekers need clear fraud and safety guidance. | New `frontend/app/safety/page.tsx`, job detail/apply/contact pages | Optional reports endpoint link. | Add guidance: never pay, verify address, no OTP/bank passwords, report suspicious/special-service offers. | No | Medium | Confirm safety links near apply/contact actions. |
| [ ] | Add employer posting policy | Clarifies prohibited job content and moderation rules. | New policy page, terms page, recruiter dashboard | Optional policy acceptance field. | Link from free listing, job create, footer. | Optional | Medium | Recruiter sees and accepts policy before posting. |
| [ ] | Add content moderation policy | Required trust signal for user-generated jobs/employer data. | New policy page, admin dashboard | Add moderation statuses if not done. | Explain review, removal, reports, appeals. | No | Medium | Policy linked from footer and report modal. |
| [ ] | Expand employer verification records | Do not claim verified unless traceable. | `backend/app/modules/spas/models.py`, dashboard spa pages, public spa/job pages | Add `verified_at`, `verified_by`, `verification_notes`, `verification_source`, `suspended_status`. | Display verified/unverified/suspended accurately. | Yes | High | Verify SPA; public badge shows date/state. |
| [ ] | Add audit logs for moderation/admin actions | Traceability for unsafe listing removal and account changes. | New audit model/routes, admin actions | Log job/spa/user moderation changes. | Admin history view. | Yes | Medium | Approve/reject/unpublish and confirm audit record. |
| [ ] | Improve legal pages | AdSense trust and privacy completeness. | `frontend/app/privacy/page.tsx`, `frontend/app/terms/page.tsx`, new disclaimer/refund/cancellation/deletion pages | None unless account deletion endpoint added. | Add conditional AdSense language, cookies, analytics, retention, deletion request, grievance contact, refund/cancellation if payments exist. | Optional | Medium | Manual legal review. |

## Phase 4 — AdSense Integration

| Status | Task | Reason | Files affected | Backend changes | Frontend changes | Database migration required | Risk | Test method |
|---|---|---|---|---|---|---|---|---|
| [ ] | Add AdSense publisher ID env support after approval | Avoid hardcoding fake publisher IDs. | `frontend/app/layout.tsx`, env docs | None. | Load AdSense script only when `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` exists and app is production. | No | Medium | Inspect production HTML with/without env var. |
| [ ] | Add `ads.txt` route/file after real publisher ID is provided | Required for AdSense inventory authorization. | `frontend/app/ads.txt/route.ts` or `frontend/public/ads.txt` | None. | Output `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` from env. | No | Low | `https://workspa.in/ads.txt` returns 200 and exact ID. |
| [ ] | Add route-based ad exclusions | Ads must not appear on unsafe/private/form pages. | New ad utility/component, layouts | Use job moderation flags if needed. | Exclude dashboard, login, register, forgot/reset, apply, forms, pending/rejected/suspended/expired jobs. | No | Medium | Visit excluded routes; confirm no ad script/slot. |
| [ ] | Add consent mode and cookie banner | Advertising/analytics cookies need user control. | `frontend/app/layout.tsx`, new consent component | Optional consent logging. | Add banner, preferences, Google consent mode defaults. | Optional | Medium | Test first visit and preference changes. |
| [ ] | Add responsive fixed ad-slot components | Prevent layout shift and accidental clicks. | New `frontend/components/ads/*`, content-rich pages | None. | Reserve dimensions below content sections, not near apply/call/forms/navigation. | No | Medium | Mobile/desktop visual test and CLS check. |
| [ ] | Define safe ad placements only | Maintain UX and policy safety. | `/blog`, `/jobs`, city pages, job detail | None. | Place ads only after content sections; never inside forms/popups/buttons. | No | Medium | Manual mobile QA. |

## Stop Condition

Do not add live AdSense code or fake `ads.txt` publisher values until:

1. Critical moderation/crawlability/trust issues are fixed.
2. A real Google AdSense publisher ID is available.
3. Search Console and Rich Results validation have been manually checked.
