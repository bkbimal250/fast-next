import {
    FaBriefcase,
    FaBuilding,
    FaMapPin,
    FaHeadphones,
  } from "react-icons/fa";
  
  export function StatsSection() {
    const stats = [
      {
        icon: FaBriefcase,
        value: "1000+",
        label: "Active Jobs",
        description: "Verified opportunities",
      },
      {
        icon: FaBuilding,
        value: "500+",
        label: "Verified Spas",
        description: "Trusted employers",
      },
      {
        icon: FaMapPin,
        value: "50+",
        label: "Cities",
        description: "Mumbai, Navi Mumbai, Thane & more",
      },
      {
        icon: FaHeadphones,
        value: "24/7",
        label: "Support",
        description: "Always here for you",
      },
    ];
  
    return (
      <section className="py-16 bg-brand-800 text-white relative overflow-hidden min-h-[280px] sm:min-h-[320px]">
        {/* Decorative background elements - fixed dimensions to prevent CLS */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: '1/1' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" style={{ aspectRatio: '1/1' }}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center min-h-[180px] sm:min-h-[200px]">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 flex-shrink-0" style={{ aspectRatio: '1/1' }}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="font-bold text-3xl sm:text-4xl text-white mb-1 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center">
                  {stat.value}
                </div>
                <div className="font-semibold text-lg text-white mb-1 min-h-[1.5rem]">
                  {stat.label}
                </div>
                <div className="text-sm text-emerald-100 min-h-[1.25rem]">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }