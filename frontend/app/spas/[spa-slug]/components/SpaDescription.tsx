'use client';

interface SpaDescriptionProps {
  description: string;
}

export default function SpaDescription({ description }: SpaDescriptionProps) {
  if (!description) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
        About Us
      </h2>
      <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
        {description}
      </div>
    </div>
  );
}

