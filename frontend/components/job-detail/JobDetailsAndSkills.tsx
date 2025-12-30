'use client';

import { FaBuilding, FaUser } from 'react-icons/fa';

interface JobDetailsAndSkillsProps {
  jobCategory?: string | { name: string };
  industryType?: string;
  jobType?: string | { name: string };
  employeeType?: string;
  requiredGender?: string;
  skills: string[];
}

export default function JobDetailsAndSkills({
  jobCategory,
  industryType,
  jobType,
  employeeType,
  requiredGender,
  skills,
}: JobDetailsAndSkillsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="text-brand-600">
          <FaBuilding size={18} />
        </div>
        Job Details
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {jobCategory && (
          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
            <span className="text-xs text-gray-600 block mb-1">Category</span>
            <p className="text-sm font-semibold text-gray-900">
              {typeof jobCategory === 'string' ? jobCategory : jobCategory.name}
            </p>
          </div>
        )}
        {industryType && (
          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
            <span className="text-xs text-gray-600 block mb-1">Industry</span>
            <p className="text-sm font-semibold text-gray-900">{industryType}</p>
          </div>
        )}
        {jobType && (
          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
            <span className="text-xs text-gray-600 block mb-1">Type</span>
            <p className="text-sm font-semibold text-gray-900">
              {typeof jobType === 'string' ? jobType : jobType.name}
            </p>
          </div>
        )}
        {employeeType && (
          <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
            <span className="text-xs text-gray-600 block mb-1">Employment</span>
            <p className="text-sm font-semibold text-gray-900">{employeeType}</p>
          </div>
        )}
        {requiredGender && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <span className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
              <div className="text-purple-600">
                <FaUser size={12} />
              </div>
              Gender
            </span>
            <p className="text-sm font-semibold text-gray-900">
              {requiredGender === 'Any' ? 'Any Gender' : `${requiredGender} Only`}
            </p>
          </div>
        )}
      </div>
      
      {/* Key Skills */}
      {skills.length > 0 && (
        <>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Key Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium border border-brand-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

