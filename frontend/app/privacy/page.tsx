import type { Metadata } from 'next';
import { FaShieldAlt, FaLock, FaUserShield, FaEye, FaDatabase, FaCookie } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Privacy Policy | SPA Jobs',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information on SPA Jobs.',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-brand-600">
              <FaShieldAlt size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
          <p className="text-gray-600 mt-2">
            At SPA Jobs, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaDatabase size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.1 Personal Information</h3>
                <p className="mb-2">When you register an account or use our services, we may collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Profile information (bio, address, location preferences)</li>
                  <li>Resume/CV and profile photos</li>
                  <li>Job application history</li>
                  <li>Payment information (if applicable)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.2 Usage Information</h3>
                <p className="mb-2">We automatically collect information about how you interact with our platform:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Job searches and filters used</li>
                  <li>Click patterns and navigation paths</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.3 Cookies and Tracking Technologies</h3>
                <p>We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. 
                You can control cookie preferences through your browser settings.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaEye size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Delivery:</strong> To provide job search, application, and messaging services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process applications, and maintain your profile</li>
                <li><strong>Communication:</strong> To send job alerts, notifications, and respond to your inquiries</li>
                <li><strong>Personalization:</strong> To recommend relevant jobs based on your preferences and search history</li>
                <li><strong>Analytics:</strong> To analyze platform usage, improve our services, and enhance user experience</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaLock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Information Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 With Employers</h3>
                <p>When you apply for a job, we share your application information (name, resume, cover letter) with the respective employer or SPA business.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Service Providers</h3>
                <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email service providers for sending notifications</li>
                  <li>Cloud hosting services for data storage</li>
                  <li>Analytics providers for usage analysis</li>
                  <li>Payment processors (if applicable)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h3>
                <p>We may disclose information if required by law, court order, or government regulation, or to protect our rights and the safety of our users.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.4 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaUserShield size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Your Rights and Choices</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails and job alerts</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@workspa.in" className="text-brand-600 hover:underline">privacy@workspa.in</a>
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaLock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                We implement industry-standard security measures to protect your personal information from unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and authorization systems</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training</li>
                <li>Secure file storage and backup systems</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-brand-600">
                <FaCookie size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Cookies and Tracking</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your account</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize content and job recommendations</li>
                <li>Track the effectiveness of our marketing campaigns</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices 
              or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. By using our platform, you consent to the transfer 
              of your information to these countries.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Section 11 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:privacy@workspa.in" className="text-brand-600 hover:underline">privacy@workspa.in</a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> <a href="tel:+911234567890" className="text-brand-600 hover:underline">+91 9152120246</a>
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> India
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>By using SPA Jobs, you acknowledge that you have read and understood this Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}

