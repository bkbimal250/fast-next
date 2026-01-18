import type { Metadata } from 'next';
import { FaFileContract, FaUserCheck, FaExclamationTriangle, FaGavel, FaHandshake } from 'react-icons/fa';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Service | Work Spa',
  description: 'Read our terms of service to understand the rules and guidelines for using Work Spa platform.',
  robots: 'index, follow',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'January 2024';

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaFileContract color="#115e59" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
          <p className="text-gray-600 mt-2">
            Welcome to Work Spa. By accessing or using our platform, you agree to be bound by these Terms of Service. 
            Please read these terms carefully before using our services.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaHandshake color="#115e59" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                By accessing or using Work Spa ("the Platform", "we", "us", "our"), you agree to comply with and be bound by 
                these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Your continued use of the Platform after changes are 
                posted constitutes your acceptance of the modified Terms. We recommend reviewing these Terms periodically.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaUserCheck color="#115e59" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">2. Eligibility</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>To use our Platform, you must:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p className="mt-4">
                You may browse jobs and submit applications without creating an account. However, certain features require 
                account registration.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Account Creation</h3>
                <p>
                  When you create an account, you agree to provide accurate, current, and complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Account Security</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintaining the confidentiality of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Using a strong, unique password</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage in 
                  fraudulent, abusive, or illegal activities.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <div className="space-y-3 text-gray-700">
              <p>As a user of our Platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide Accurate Information:</strong> Submit truthful and accurate information in your profile, applications, and communications</li>
                <li><strong>Respect Others:</strong> Treat other users, employers, and our staff with respect and professionalism</li>
                <li><strong>No Spam:</strong> Not send unsolicited messages, spam, or promotional materials</li>
                <li><strong>No Fraud:</strong> Not engage in fraudulent activities, misrepresentation, or identity theft</li>
                <li><strong>No Harassment:</strong> Not harass, threaten, or abuse other users</li>
                <li><strong>Comply with Laws:</strong> Use the Platform in compliance with all applicable laws and regulations</li>
                <li><strong>Intellectual Property:</strong> Respect intellectual property rights of others</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Job Postings and Applications</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.1 Job Postings</h3>
                <p>Employers posting jobs agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Post accurate and complete job descriptions</li>
                  <li>Comply with equal opportunity employment laws</li>
                  <li>Respond to applications in a timely manner</li>
                  <li>Not post discriminatory, illegal, or fraudulent job listings</li>
                  <li>Maintain the confidentiality of applicant information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Job Applications</h3>
                <p>Job seekers agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Submit accurate and truthful application materials</li>
                  <li>Not apply for jobs for which they are not qualified</li>
                  <li>Respect the application process and employer requirements</li>
                  <li>Not submit multiple applications for the same position unless requested</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Application Process</h3>
                <p>
                  We facilitate the connection between job seekers and employers. We are not responsible for the hiring decisions, 
                  application processes, or employment terms of employers. All employment decisions are made solely by the employers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle color="#115e59" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">6. Prohibited Activities</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>You are strictly prohibited from:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Illegal Activities:</strong> Using the Platform for any illegal purpose or in violation of any laws</li>
                <li><strong>Fraud:</strong> Engaging in fraudulent activities, misrepresentation, or identity theft</li>
                <li><strong>Spam:</strong> Sending unsolicited messages, spam, or promotional materials</li>
                <li><strong>Harassment:</strong> Harassing, threatening, or abusing other users</li>
                <li><strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to our systems or other users' accounts</li>
                <li><strong>Data Mining:</strong> Scraping, crawling, or extracting data from the Platform without authorization</li>
                <li><strong>Malware:</strong> Uploading viruses, malware, or harmful code</li>
                <li><strong>Impersonation:</strong> Impersonating another person or entity</li>
                <li><strong>Circumvention:</strong> Attempting to circumvent security measures or access controls</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                The Platform and its content, including but not limited to text, graphics, logos, images, software, and code, 
                are the property of Work Spa or its licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works, publicly display, or commercially exploit 
                any content from the Platform without our express written permission.
              </p>
              <p>
                By submitting content (including job applications, messages, or profile information) to the Platform, you grant 
                us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose 
                of operating the Platform.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Platform "As Is":</strong> The Platform is provided "as is" and "as available" without warranties of any kind, 
                either express or implied. We do not guarantee that the Platform will be uninterrupted, error-free, or secure.
              </p>
              <p>
                <strong>Job Listings:</strong> We do not verify the accuracy of job listings or the legitimacy of employers. 
                Users are responsible for verifying job opportunities and employer credentials before applying.
              </p>
              <p>
                <strong>No Employment Guarantee:</strong> We do not guarantee that users will find employment or that employers 
                will find suitable candidates through our Platform.
              </p>
              <p>
                <strong>Third-Party Content:</strong> The Platform may contain links to third-party websites or content. 
                We are not responsible for the accuracy, legality, or content of such third-party sites.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                To the maximum extent permitted by law, Work Spa and its affiliates, officers, employees, and agents shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption</li>
                <li>Personal injury or property damage</li>
                <li>Employment-related disputes or issues</li>
                <li>Errors or omissions in job listings</li>
              </ul>
              <p className="mt-4">
                Our total liability for any claims arising from your use of the Platform shall not exceed the amount you paid 
                to us (if any) in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless Work Spa and its affiliates, officers, employees, and agents 
              from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-gray-700">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you submit to the Platform</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We reserve the right to suspend or terminate your access to the Platform at any time, with or without cause or notice, 
                for any reason including but not limited to violation of these Terms.
              </p>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion feature (if available). 
                Upon termination, your right to use the Platform will immediately cease.
              </p>
              <p>
                Sections of these Terms that by their nature should survive termination shall survive, including but not limited to 
                intellectual property rights, disclaimers, limitation of liability, and indemnification.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaGavel color="#115e59" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">12. Governing Law and Dispute Resolution</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its 
                conflict of law provisions.
              </p>
              <p>
                Any disputes arising from or relating to these Terms or your use of the Platform shall be resolved through 
                good faith negotiation. If negotiation fails, disputes shall be subject to the exclusive jurisdiction of 
                the courts located in India.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting 
              the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Platform after 
              changes are posted constitutes your acceptance of the modified Terms.
            </p>
          </section>

          {/* Section 14 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions 
              shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that 
              most closely reflects the intent of the original provision.
            </p>
          </section>

          {/* Section 15 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:legal@workspa.in" className="text-brand-600 hover:underline">legal@workspa.in</a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> <a href="tel:+911234567890" className="text-brand-600 hover:underline">+91 9152120246</a>
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> Navi Mumbai,Mumbai, Thane India

              </p>
            </div>
          </section>
        </div>


      </div>
    </div>
    </>
  );
}

