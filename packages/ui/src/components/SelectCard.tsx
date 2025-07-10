import React from 'react';

export interface SelectCardOption {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectCardProps {
  options: SelectCardOption[];
  value?: string;
  onChange: (value: string) => void;
  name: string;
  error?: string;
  required?: boolean;
  label?: string;
}

const SelectCard: React.FC<SelectCardProps> = ({
  options,
  value,
  onChange,
  name,
  error,
  required = false,
  label,
}) => {
  return (
    <fieldset className="w-full">
      {label && (
        <legend className="block mb-3 font-semibold form-label text-gray-900 dark:text-white" data-testid={`${name}-label`}>
          {label}
          {required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
        </legend>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <div
            key={option.id}
            className={`
              relative border rounded-lg p-4 transition-all cursor-pointer
              ${
                value === option.id
                  ? 'border-primary-800 dark:border-accent-100 bg-primary-50 dark:bg-primary-800 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-600 dark:hover:border-accent-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
            onClick={() => onChange(option.id)}
            data-testid={`${name}-option-${option.id}`}
            role="radio"
            aria-checked={value === option.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(option.id);
              }
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
              required={required}
              aria-labelledby={`${name}-${option.id}-title`}
              aria-describedby={option.description ? `${name}-${option.id}-desc` : undefined}
            />

            {option.icon && (
              <div className="mb-3 text-4xl text-primary-800 dark:text-accent-100">
                {option.icon}
              </div>
            )}

            <h3
              id={`${name}-${option.id}-title`}
              className={`font-medium text-lg ${value === option.id ? 'text-primary-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}
            >
              {option.title}
            </h3>

            {option.description && (
              <p
                id={`${name}-${option.id}-desc`}
                className="mt-1 text-sm text-gray-700 dark:text-gray-300"
              >
                {option.description}
              </p>
            )}

            {value === option.id && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary-800 dark:bg-accent-100 flex items-center justify-center">
                <span className="sr-only">Seleccionado</span>
                <svg className="h-3 w-3 text-white dark:text-primary-800" viewBox="0 0 12 12">
                  <path
                    fill="currentColor"
                    d="M3.707 5.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 1 0-1.414-1.414L5 6.586 3.707 5.293z"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
          data-testid={`${name}-error`}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default SelectCard;
