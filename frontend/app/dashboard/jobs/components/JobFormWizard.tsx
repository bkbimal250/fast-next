'use client';

import { ReactNode } from 'react';

interface JobFormWizardProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onStepChange?: (step: number) => void;
}

export default function JobFormWizard({ currentStep, totalSteps, children, onStepChange }: JobFormWizardProps) {
  const steps = [
    { number: 1, title: 'Basic Information', description: 'Job details & description' },
    { number: 2, title: 'Location & Details', description: 'Salary, location & contact' },
  ];

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => onStepChange && onStepChange(step.number)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  } transition-colors duration-300`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {children}
      </div>
    </div>
  );
}

