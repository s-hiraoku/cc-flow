import React from 'react';
import LiquidGlass from 'liquid-glass-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glassEffect?: boolean;
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  glassEffect = false,
  hover = true
}: CardProps) {
  const baseClasses = "rounded-lg transition-all duration-200";

  const standardClasses = `
    ${baseClasses}
    bg-white border border-gray-200 shadow-sm
    ${hover ? 'hover:shadow-md hover:border-gray-300' : ''}
    ${className}
  `.trim();

  const glassClasses = `
    ${baseClasses}
    backdrop-blur-xl bg-white/10 border border-white/20
    ${hover ? 'hover:bg-white/20 hover:scale-105' : ''}
    ${className}
  `.trim();

  const CardContent = (
    <div className={glassEffect ? glassClasses : standardClasses}>
      {children}
    </div>
  );

  if (glassEffect) {
    return (
      <LiquidGlass displacementScale={10} blurAmount={2}>
        {CardContent}
      </LiquidGlass>
    );
  }

  return CardContent;
}