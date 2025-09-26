import React from 'react';
import LiquidGlass from 'liquid-glass-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glassEffect?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  glassEffect = false,
  className = '',
  onClick,
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseClasses = "font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const glassVariants = {
    primary: "bg-gradient-to-r from-indigo-500/80 to-purple-600/80 backdrop-blur-xl border border-white/20 text-white hover:from-indigo-600/90 hover:to-purple-700/90",
    secondary: "backdrop-blur-xl bg-white/20 border border-white/30 text-white hover:bg-white/30",
    ghost: "backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
  };

  const buttonClasses = `
    ${baseClasses}
    ${glassEffect ? glassVariants[variant] : variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  const ButtonContent = (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );

  if (glassEffect) {
    return (
      <LiquidGlass displacementScale={8} blurAmount={2}>
        {ButtonContent}
      </LiquidGlass>
    );
  }

  return ButtonContent;
}