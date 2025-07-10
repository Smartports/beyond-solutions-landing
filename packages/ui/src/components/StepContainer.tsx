import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface StepContainerProps {
  children: React.ReactNode;
  title?: string;
  isActive: boolean;
  stepId: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

const StepContainer: React.FC<StepContainerProps> = ({
  children,
  title,
  isActive,
  stepId,
  onNext,
  onPrevious,
}) => {
  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      : false;

  // Animation variants
  const variants = {
    hidden: {
      opacity: prefersReducedMotion ? 0 : 0,
      x: prefersReducedMotion ? 0 : -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.4,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: prefersReducedMotion ? 0 : 0,
      x: prefersReducedMotion ? 0 : 20,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeInOut',
      },
    },
  };

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepId}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className="w-full"
        role="group"
        aria-labelledby={`${stepId}-title`}
        aria-hidden={!isActive}
      >
        {title && (
          <h2
            id={`${stepId}-title`}
            className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {title}
          </h2>
        )}
        <div className="space-y-6">{children}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 gap-4 flex-col sm:flex-row">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold 
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 
                         focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
                         order-2 sm:order-1 w-full sm:w-auto"
              aria-label="Volver al paso anterior"
            >
              <span>Anterior</span>
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-3 rounded-full bg-primary-800 text-white font-semibold 
                         hover:bg-primary-900 transition-colors focus:outline-none focus:ring-2 
                         focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
                         order-1 sm:order-2 w-full sm:w-auto"
              aria-label="Continuar al siguiente paso"
            >
              <span>Siguiente</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StepContainer;
