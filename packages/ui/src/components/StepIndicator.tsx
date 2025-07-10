import React from 'react';

export interface StepIndicatorProps {
  steps: Array<{
    id: string;
    title: string;
  }>;
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav
      className="w-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-8 overflow-x-auto"
      aria-label="Progreso del wizard"
    >
      {steps.map((step, idx) => {
        const isActive = currentStep === idx;
        const isPast = currentStep > idx;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick && onStepClick(idx)}
            disabled={!onStepClick}
            className={
              `relative flex flex-col items-center group focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded-lg p-2` +
              ` ${isPast ? 'text-primary-800 dark:text-white' : ''}`
            }
            aria-current={isActive ? 'step' : undefined}
          >
            {/* Circle */}
            <div
              className={
                `w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-200` +
                ` ${isActive ? 'bg-primary-800 border-primary-800 text-white shadow-lg' : ''}` +
                ` ${isPast && !isActive ? 'bg-primary-100 dark:bg-primary-800 border-primary-800 dark:border-primary-600 text-primary-800 dark:text-white' : ''}` +
                ` ${!isPast && !isActive ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200' : ''}`
              }
            >
              {isPast ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="font-semibold text-sm">{idx + 1}</span>
              )}
            </div>
            {/* Label */}
            <span
              className={
                `mt-2 text-xs font-medium whitespace-nowrap transition-colors` +
                ` ${isActive ? 'text-primary-800 dark:text-white' : ''}` +
                ` ${isPast && !isActive ? 'text-primary-800 dark:text-white' : ''}` +
                ` ${!isPast && !isActive ? 'text-gray-700 dark:text-gray-200' : ''}`
              }
            >
              {step.title}
            </span>
            {/* Connector */}
            {idx !== steps.length - 1 && (
              <span
                className={`absolute top-1/2 -right-4 md:-right-6 lg:-right-8 w-8 h-0.5 md:w-12 lg:w-16 transition-colors duration-200` +
                  ` ${isPast ? 'bg-primary-800 dark:bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default StepIndicator;
