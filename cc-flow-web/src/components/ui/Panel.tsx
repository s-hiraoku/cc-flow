import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'dark';
}

export function Panel({
  children,
  title,
  subtitle,
  className = '',
  variant = 'default'
}: PanelProps) {
  const baseClasses = "flex flex-col h-full";

  const standardClasses = {
    default: "bg-white border-gray-200 shadow-sm",
    dark: "bg-gray-900 border-gray-700"
  };

  const textClasses = {
    default: "text-gray-900",
    dark: "text-white"
  };

  const subtitleClasses = {
    default: "text-gray-500",
    dark: "text-gray-400"
  };

  const panelClasses = `
    ${baseClasses}
    ${standardClasses[variant]}
    border rounded-lg
    ${className}
  `.trim();

  return (
    <div className={panelClasses}>
      {(title || subtitle) && (
        <div className="p-4 border-b border-gray-200">
          {title && (
            <h2 className={`text-lg font-semibold ${textClasses[variant]}`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-sm mt-1 ${subtitleClasses[variant]}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}