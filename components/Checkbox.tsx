import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, id }) => {
  // Generate a predictable ID from the label if no ID is provided, for accessibility.
  const checkboxId = id || `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label htmlFor={checkboxId} className="flex items-center space-x-3 cursor-pointer">
      <div className="relative">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer appearance-none w-5 h-5 bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-md checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition cursor-pointer"
        />
        <svg
          className="absolute w-3.5 h-3.5 text-white pointer-events-none top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">{label}</span>
    </label>
  );
};