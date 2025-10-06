import React from 'react';
import LiquidGlass from 'liquid-glass-react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  glassEffect?: boolean;
  required?: boolean;
  id?: string;
  error?: string;
  name?: string;
}

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  className = '',
  glassEffect = false,
  required = false,
  id,
  error,
  name
}: InputProps) {
  const baseClasses = "w-full px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const standardClasses = `
    ${baseClasses}
    border shadow-sm bg-white text-gray-900
    placeholder:text-gray-500
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
    ${className}
  `.trim();

  const glassClasses = `
    ${baseClasses}
    backdrop-blur-xl bg-white/20 border border-white/30
    text-white placeholder:text-white/70
    focus:ring-white/50 focus:border-white/50
    ${className}
  `.trim();

  const InputElement = (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      className={glassEffect ? glassClasses : standardClasses}
    />
  );

  const inputContent = glassEffect ? (
    <LiquidGlass displacementScale={5} blurAmount={1}>
      {InputElement}
    </LiquidGlass>
  ) : InputElement;

  if (label) {
    return (
      <div>
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-2 ${
            glassEffect ? 'text-white/90' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {inputContent}
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
      {inputContent}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}