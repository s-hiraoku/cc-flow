import React from 'react';

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  required?: boolean;
  id?: string;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  className = '',
  rows = 3,
  required = false,
  id
}: TextareaProps) {
  const baseClasses = "w-full px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none";

  const textareaClasses = `
    ${baseClasses}
    border border-gray-300 shadow-sm
    focus:ring-indigo-500 focus:border-indigo-500
    ${className}
  `.trim();

  const TextareaElement = (
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
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
      </div>
    );
  }

  return TextareaElement;
}