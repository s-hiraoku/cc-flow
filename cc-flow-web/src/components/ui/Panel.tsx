import React from "react";

type PanelVariant = "default" | "dark";

interface PanelProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  className?: string;
  variant?: PanelVariant;
}

const containerBase = "flex h-full flex-col rounded-2xl border";

const containerVariants: Record<PanelVariant, string> = {
  default: "border-gray-200 bg-white text-gray-900 shadow-lg",
  dark: "border-white/10 bg-slate-950/60 text-slate-100 shadow-lg backdrop-blur-lg",
};

const headerBorder: Record<PanelVariant, string> = {
  default: "border-gray-200",
  dark: "border-white/10",
};

const titleClasses: Record<PanelVariant, string> = {
  default: "text-gray-900",
  dark: "text-white",
};

const subtitleClasses: Record<PanelVariant, string> = {
  default: "text-gray-500",
  dark: "text-gray-400",
};

export function Panel({
  children,
  title,
  subtitle,
  className = "",
  variant = "default",
}: PanelProps) {
  return (
    <div className={`${containerBase} ${containerVariants[variant]} ${className}`.trim()}>
      {(title || subtitle) && (
        <div className={`border-b px-4 py-3 ${headerBorder[variant]}`}>
          {title ? (
            <h2 className={`text-lg font-semibold ${titleClasses[variant]}`}>{title}</h2>
          ) : null}
          {subtitle ? (
            <p className={`mt-1 text-sm ${subtitleClasses[variant]}`}>{subtitle}</p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}
