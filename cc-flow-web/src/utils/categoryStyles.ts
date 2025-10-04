// Dynamic icon palette for categories
export const ICON_PALETTE = [
  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", // Document
  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", // Settings/Cog
  "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a1 1 0 00-.115-.023l-1.04-.208a1 1 0 01-.471-.284 1 1 0 01-.284-.471l-.208-1.04a1 1 0 00-.023-.115l-.477-2.387a2 2 0 00-.547-1.022A2 2 0 0011.416 9H11a2 2 0 00-2 2v4a2 2 0 002 2h1.416a2 2 0 001.437-.593z", // Puzzle piece
  "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Lightning/Energy
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", // Book/Library
  "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", // Code
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", // Heart/Favorite
  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" // Cube/3D
];

// Dynamic color palette for categories
export const COLOR_PALETTE = [
  {
    border: "border-sky-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-sky-300/60 hover:bg-sky-500/10",
    icon: "bg-sky-500/20 text-sky-100",
    handle: "bg-sky-400",
    ring: "ring-sky-400/50",
    solidBg: "bg-gradient-to-br from-sky-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-sky-400/50",
    text: "text-sky-100"
  },
  {
    border: "border-emerald-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-emerald-300/60 hover:bg-emerald-500/10",
    icon: "bg-emerald-500/20 text-emerald-100",
    handle: "bg-emerald-400",
    ring: "ring-emerald-400/50",
    solidBg: "bg-gradient-to-br from-emerald-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-emerald-400/50",
    text: "text-emerald-100"
  },
  {
    border: "border-violet-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-violet-300/60 hover:bg-violet-500/10",
    icon: "bg-violet-500/20 text-violet-100",
    handle: "bg-violet-400",
    ring: "ring-violet-400/50",
    solidBg: "bg-gradient-to-br from-violet-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-violet-400/50",
    text: "text-violet-100"
  },
  {
    border: "border-amber-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-amber-300/60 hover:bg-amber-500/10",
    icon: "bg-amber-500/20 text-amber-100",
    handle: "bg-amber-400",
    ring: "ring-amber-400/50",
    solidBg: "bg-gradient-to-br from-amber-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-amber-400/50",
    text: "text-amber-100"
  },
  {
    border: "border-rose-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-rose-300/60 hover:bg-rose-500/10",
    icon: "bg-rose-500/20 text-rose-100",
    handle: "bg-rose-400",
    ring: "ring-rose-400/50",
    solidBg: "bg-gradient-to-br from-rose-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-rose-400/50",
    text: "text-rose-100"
  },
  {
    border: "border-indigo-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-indigo-300/60 hover:bg-indigo-500/10",
    icon: "bg-indigo-500/20 text-indigo-100",
    handle: "bg-indigo-400",
    ring: "ring-indigo-400/50",
    solidBg: "bg-gradient-to-br from-indigo-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-indigo-400/50",
    text: "text-indigo-100"
  },
  {
    border: "border-teal-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-teal-300/60 hover:bg-teal-500/10",
    icon: "bg-teal-500/20 text-teal-100",
    handle: "bg-teal-400",
    ring: "ring-teal-400/50",
    solidBg: "bg-gradient-to-br from-teal-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-teal-400/50",
    text: "text-teal-100"
  },
  {
    border: "border-cyan-400/40",
    bg: "bg-slate-950/70",
    hover: "hover:border-cyan-300/60 hover:bg-cyan-500/10",
    icon: "bg-cyan-500/20 text-cyan-100",
    handle: "bg-cyan-400",
    ring: "ring-cyan-400/50",
    solidBg: "bg-gradient-to-br from-cyan-500/15 via-slate-950/80 to-slate-950/90",
    solidBorder: "border-cyan-400/50",
    text: "text-cyan-100"
  }
];

// Get index based on first letter of category name
export function getIndexFromFirstLetter(str: string): number {
  if (!str) return 0;
  const firstLetter = str.toLowerCase().charAt(0);
  const charCode = firstLetter.charCodeAt(0);

  // Map a-z (97-122) to 0-25, then mod by palette size
  if (charCode >= 97 && charCode <= 122) {
    return (charCode - 97) % 8; // 8 is our palette size
  }

  // For non-alphabetic characters, use char code
  return charCode % 8;
}

// Get category colors based on category name
export function getCategoryColors(category?: string) {
  if (!category) {
    return {
      border: "border-white/15",
      bg: "bg-slate-950/70",
      hover: "hover:border-indigo-300/60 hover:bg-indigo-500/10",
      icon: "bg-slate-700/70 text-slate-200",
      handle: "bg-indigo-300",
      ring: "ring-indigo-300/40",
      solidBg: "bg-gradient-to-br from-indigo-500/10 via-slate-950/80 to-slate-950/90",
      solidBorder: "border-white/15",
      text: "text-slate-100"
    };
  }

  const colorIndex = getIndexFromFirstLetter(category);
  return COLOR_PALETTE[colorIndex];
}

// Get category icon based on category name
export function getCategoryIcon(category?: string): string {
  if (!category) return ICON_PALETTE[0]; // Default icon
  const iconIndex = getIndexFromFirstLetter(category);
  return ICON_PALETTE[iconIndex];
}

// Get category border and background for palette
export function getCategoryBorderAndBg(category?: string): string {
  const colors = getCategoryColors(category);
  return `${colors.border} ${colors.bg} ${colors.hover}`;
}

// Get category icon color
export function getCategoryIconColor(category: string): string {
  const colors = getCategoryColors(category);
  return colors.icon;
}
