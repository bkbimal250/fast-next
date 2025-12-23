import type { Metadata } from 'next';
import { FaUsers, FaBullseye, FaHandshake, FaAward, FaHeart } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'About Us | SPA Jobs',
  description: 'Learn about SPA Jobs - India\'s leading platform connecting job seekers with spa businesses. Our mission, vision, and values.',
  robots: 'index, follow',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About SPA Jobs</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talented professionals with exceptional spa opportunities across India
          </p>
        </div>

        {/* Mission Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center">
                <FaBullseye color="#ffffff" size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To bridge the gap between skilled spa professionals and thriving spa businesses, 
                creating meaningful career opportunities while supporting the growth of the wellness 
                industry in India. We believe everyone deserves to find their perfect job match 
                without barriers.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center">
                <FaAward color="#ffffff" size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To become India's most trusted and comprehensive platform for spa job opportunities, 
                empowering thousands of professionals to build rewarding careers in wellness and 
                helping spa businesses find the perfect talent to grow their teams.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <FaHeart color="#115e59" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Accessibility</h3>
                <p className="text-gray-600 text-sm">
                  We believe job searching should be free and accessible to everyone. 
                  No login required to browse and apply.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <FaHandshake color="#115e59" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Transparency</h3>
                <p className="text-gray-600 text-sm">
                  Clear job descriptions, honest employer information, and transparent 
                  application processes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <FaUsers color="#115e59" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Community</h3>
                <p className="text-gray-600 text-sm">
                  Building a supportive community of spa professionals and businesses 
                  working together for mutual success.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <FaAward color="#115e59" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Excellence</h3>
                <p className="text-gray-600 text-sm">
                  Committed to providing the best user experience and connecting 
                  quality candidates with quality opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Job Search</h3>
                <p className="text-gray-600 text-sm">
                  Browse thousands of spa jobs across India without creating an account. 
                  Search by location, job type, salary, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Easy Application Process</h3>
                <p className="text-gray-600 text-sm">
                  Apply to jobs directly with just your name, contact info, and resume. 
                  No lengthy registration forms required.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location-Based Search</h3>
                <p className="text-gray-600 text-sm">
                  Find jobs near you with our "Near Me" feature and location-based filters. 
                  Perfect for finding opportunities in your city or area.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Job Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Subscribe to email notifications and get alerted when new jobs matching 
                  your preferences are posted.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Assistant</h3>
                <p className="text-gray-600 text-sm">
                  Use our intelligent chatbot to find jobs through natural language queries. 
                  Just ask "I need therapist jobs in Mumbai" and get instant results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of spa professionals who have found their perfect career match through SPA Jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/jobs"
              className="px-6 py-3 bg-white text-brand-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Jobs
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-400 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

