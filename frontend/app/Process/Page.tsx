'use client';

import Image from 'next/image';

export default function ProcessPage() {
  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-14 mb-12 overflow-hidden">

      {/* Background Image */}
   

      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          How It Works
        </h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Find Work Spa faster with a simple, transparent hiring process
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        
        {/* Images Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Connector line for images */}
          <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-[70%] h-px bg-gray-200" />
          
          {/* Step 1 Image */}
          <div className="relative w-full h-48 md:h-64 mx-auto">
            <Image
              src="/uploads/step1.png"
              alt="Create Your Profile"
              fill
              className="object-contain"
            />
          </div>

          {/* Step 2 Image */}
          <div className="relative w-full h-48 md:h-64 mx-auto">
            <Image
              src="/uploads/step2.png"
              alt="Search & Apply"
              fill
              className="object-contain"
            />
          </div>

          {/* Step 3 Image */}
          <div className="relative w-full h-48 md:h-64 mx-auto">
            <Image
              src="/uploads/step3.png"
              alt="Get Hired"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Steps Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Step 1 */}
          <Step
            title="Create Your Profile"
            desc="Add your basic details or continue without login to explore Work Spa."
          />

          {/* Step 2 */}
          <Step
            title="Search & Apply"
            desc="Find nearby Work Spa, view details, and apply instantly with your CV."
          />

          {/* Step 3 */}
          <Step
            title="Get Hired"
            desc="Connect directly with spa owners and start your next job quickly."
          />
        </div>

      </div>
    </section>
  );
}

/* 🔹 Step Card Component */
function Step({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="relative text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
