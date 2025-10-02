import React from 'react';

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  required?: boolean;
  id?: string;
  error?: string;
  name?: string;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  className = '',
  rows = 3,
  required = false,
  id,
  error,
  name
}: TextareaProps) {
  const baseClasses = "w-full px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none";

  const textareaClasses = `
    ${baseClasses}
    border shadow-sm bg-white text-gray-900
    placeholder:text-gray-500
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
    ${className}
  `.trim();

  const TextareaElement = (
    <textarea
      id={id}
      name={name}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      className={textareaClasses}
    />
  );

  if (label) {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {TextareaElement}
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {TextareaElement}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}