'use client';

export default function ProcessPage() {
  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-14 mb-12 overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-50 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-100/40 rounded-full blur-3xl" />
      </div>

      {/* Heading */}
      <div className="relative text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          How It Works
        </h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Find Work Spa faster with a simple, transparent hiring process
        </p>
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        
        {/* Connector line (desktop only) */}
        <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-[70%] h-px bg-gray-200" />

        {/* Step 1 */}
        <div className="relative text-center group">
          <div className="relative z-10 bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 11c0 .552-.224 1-.5 1s-.5-.448-.5-1 .224-1 .5-1 .5.448.5 1zm0 0v2m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Create Your Profile
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Add your basic details or continue without login to explore Work Spa.
          </p>
        </div>

        {/* Step 2 */}
        <div className="relative text-center group">
          <div className="relative z-10 bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search & Apply
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Find nearby Work Spa, view details, and apply instantly with your CV.
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative text-center group">
          <div className="relative z-10 bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get Hired
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Connect directly with spa owners and start your next job quickly.
          </p>
        </div>

      </div>

      
    </section>
  );
}
