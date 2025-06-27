import React from 'react';

export interface StepIndicatorProps {
  steps: Array<{
    id: string;
    title: string;
  }>;
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <nav className="flex items-center gap-2 mb-8 overflow-x-auto p-1" aria-label="Progreso del wizard">
      {steps.map((step, idx) => {
        const isActive = currentStep === idx;
        const isPast = currentStep > idx;
        
        return (
          <button
            key={step.id}
            className={`
              step-indicator flex items-center gap-2 px-3 py-2 rounded transition-colors focus:outline-none 
              focus:ring-2 focus:ring-primary-800 focus:ring-offset-2 dark:focus:ring-offset-zinc-800
              ${isActive 
                ? 'bg-primary-800 text-white animate-step' 
                : 'bg-accent-50 dark:bg-primary-800 text-primary-800 dark:text-accent-50 hover:bg-accent-100 dark:hover:bg-primary-700'
              }
              ${isPast ? 'after:content-["✓"] after:ml-1 after:text-xs' : ''}
            `}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Ir al paso ${idx + 1}: ${step.title}`}
            aria-selected={isActive}
            onClick={() => onStepClick && onStepClick(idx)}
            disabled={!onStepClick}
            type="button"
          >
            <span className="text-accent-100 dark:text-accent-100">{step.title}</span>
            <span className="sr-only">{isActive ? '(paso actual)' : ''}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default StepIndicator; 