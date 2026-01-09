import type { Metadata } from 'next';
import Image from 'next/image';
import { FaUsers, FaBullseye, FaHandshake, FaAward, FaHeart, FaCheckCircle, FaRocket, FaShieldAlt, FaGlobe } from 'react-icons/fa';
import SubscribeForm from '@/components/SubscribeForm';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'About Us | Work Spa',
  description: 'Learn about Work Spa - India\'s leading platform connecting job seekers with spa businesses. Our mission, vision, and values.',
  robots: 'index, follow',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                About Work Spa
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Connecting Talent with
                <span className="block text-gold-400">Opportunity</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                India's leading platform connecting skilled spa professionals with exceptional career opportunities. 
                We're building the future of wellness industry recruitment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/jobs"
                  className="px-8 py-4 bg-white text-brand-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                >
                  Explore Jobs
                </a>
                <a
                  href="/contact"
                  className="px-8 py-4 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-400 transition-all border-2 border-white/30 text-center"
                >
                  Get in Touch
                </a>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                
                
            
                  <Image
                    src="/uploads/about-hero.jpg"
                    alt="Work Spa - Connecting Professionals"
                    width={450}
                    height={450}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gold-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-brand-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Mission Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaBullseye color="#ffffff" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                To bridge the gap between skilled spa professionals and thriving spa businesses, 
                creating meaningful career opportunities while supporting the growth of the wellness 
                industry in India. We believe everyone deserves to find their perfect job match 
                without barriers.
              </p>
            </div>
          </section>

          {/* Vision Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gold-50 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaAward color="#ffffff" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                To become India's most trusted and comprehensive platform for spa job opportunities, 
                empowering thousands of professionals to build rewarding careers in wellness and 
                helping spa businesses find the perfect talent to grow their teams.
              </p>
            </div>
          </section>
        </div>

        {/* Values Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-50 rounded-full translate-y-32 -translate-x-32 blur-3xl opacity-50"></div>
          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Our Core Values</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaHeart className="text-red-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Accessibility</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We believe job searching should be free and accessible to everyone. 
                      No login required to browse and apply.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaHandshake className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Transparency</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Clear job descriptions, honest employer information, and transparent 
                      application processes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Community</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Building a supportive community of spa professionals and businesses 
                      working together for mutual success.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaAward className="text-green-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Excellence</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Committed to providing the best user experience and connecting 
                      quality candidates with quality opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">What We Offer</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to find your perfect spa career
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaGlobe className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Free Job Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse thousands of Work Spa across India without creating an account. 
                Search by location, job type, salary, and more.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaRocket className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Easy Application</h3>
              <p className="text-gray-600 leading-relaxed">
                Apply to jobs directly with just your name, contact info, and resume. 
                No lengthy registration forms required.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Location-Based Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Find jobs near you with our "Near Me" feature and location-based filters. 
                Perfect for finding opportunities in your city or area.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaCheckCircle className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Job Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Subscribe to email notifications and get alerted when new jobs matching 
                your preferences are posted.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gold-50 to-white rounded-xl p-6 border border-gold-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-gold-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaRocket className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">AI-Powered Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Use our intelligent chatbot to find jobs through natural language queries. 
                Just ask "I need therapist jobs in Mumbai" and get instant results.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaUsers className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Verified Employers</h3>
              <p className="text-gray-600 leading-relaxed">
                All spa businesses are verified to ensure authentic job opportunities 
                and protect job seekers from scams.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-white mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
          </div>
          <div className="relative text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Thousands of professionals trust Work Spa for their career journey
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gold-400 mb-2">1000+</div>
              <div className="text-white/80 text-sm sm:text-base">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gold-400 mb-2">500+</div>
              <div className="text-white/80 text-sm sm:text-base">Verified SPAs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gold-400 mb-2">50+</div>
              <div className="text-white/80 text-sm sm:text-base">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gold-400 mb-2">24/7</div>
              <div className="text-white/80 text-sm sm:text-base">Support</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white rounded-2xl shadow-lg border-2 border-brand-200 p-8 sm:p-10 text-center mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-full -translate-y-24 translate-x-24 blur-2xl"></div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ready to Start Your Career Journey?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of spa professionals who have found their perfect career match through Work Spa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/jobs"
                className="px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse All Jobs
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-brand-600 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-brand-600"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* Subscription Form */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
          <SubscribeForm />
        </section>
      </div>
    </div>
  );
}

