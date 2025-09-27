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
    border: "border-blue-300",
    bg: "bg-gradient-to-r from-white to-blue-50",
    hover: "hover:border-blue-400 hover:from-blue-50 hover:to-blue-100",
    icon: "bg-blue-100 text-blue-600",
    handle: "bg-blue-500",
    ring: "ring-blue-500",
    solidBg: "bg-blue-50",
    solidBorder: "border-blue-300"
  },
  {
    border: "border-green-300",
    bg: "bg-gradient-to-r from-white to-green-50",
    hover: "hover:border-green-400 hover:from-green-50 hover:to-green-100",
    icon: "bg-green-100 text-green-600",
    handle: "bg-green-500",
    ring: "ring-green-500",
    solidBg: "bg-green-50",
    solidBorder: "border-green-300"
  },
  {
    border: "border-purple-300",
    bg: "bg-gradient-to-r from-white to-purple-50",
    hover: "hover:border-purple-400 hover:from-purple-50 hover:to-purple-100",
    icon: "bg-purple-100 text-purple-600",
    handle: "bg-purple-500",
    ring: "ring-purple-500",
    solidBg: "bg-purple-50",
    solidBorder: "border-purple-300"
  },
  {
    border: "border-orange-300",
    bg: "bg-gradient-to-r from-white to-orange-50",
    hover: "hover:border-orange-400 hover:from-orange-50 hover:to-orange-100",
    icon: "bg-orange-100 text-orange-600",
    handle: "bg-orange-500",
    ring: "ring-orange-500",
    solidBg: "bg-orange-50",
    solidBorder: "border-orange-300"
  },
  {
    border: "border-pink-300",
    bg: "bg-gradient-to-r from-white to-pink-50",
    hover: "hover:border-pink-400 hover:from-pink-50 hover:to-pink-100",
    icon: "bg-pink-100 text-pink-600",
    handle: "bg-pink-500",
    ring: "ring-pink-500",
    solidBg: "bg-pink-50",
    solidBorder: "border-pink-300"
  },
  {
    border: "border-indigo-300",
    bg: "bg-gradient-to-r from-white to-indigo-50",
    hover: "hover:border-indigo-400 hover:from-indigo-50 hover:to-indigo-100",
    icon: "bg-indigo-100 text-indigo-600",
    handle: "bg-indigo-500",
    ring: "ring-indigo-500",
    solidBg: "bg-indigo-50",
    solidBorder: "border-indigo-300"
  },
  {
    border: "border-teal-300",
    bg: "bg-gradient-to-r from-white to-teal-50",
    hover: "hover:border-teal-400 hover:from-teal-50 hover:to-teal-100",
    icon: "bg-teal-100 text-teal-600",
    handle: "bg-teal-500",
    ring: "ring-teal-500",
    solidBg: "bg-teal-50",
    solidBorder: "border-teal-300"
  },
  {
    border: "border-yellow-300",
    bg: "bg-gradient-to-r from-white to-yellow-50",
    hover: "hover:border-yellow-400 hover:from-yellow-50 hover:to-yellow-100",
    icon: "bg-yellow-100 text-yellow-600",
    handle: "bg-yellow-500",
    ring: "ring-yellow-500",
    solidBg: "bg-yellow-50",
    solidBorder: "border-yellow-300"
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
      border: "border-gray-300",
      bg: "bg-gradient-to-r from-white to-gray-50",
      hover: "hover:border-gray-400 hover:from-gray-50 hover:to-gray-100",
      icon: "bg-gray-100 text-gray-600",
      handle: "bg-gray-500",
      ring: "ring-gray-500",
      solidBg: "bg-gray-50",
      solidBorder: "border-gray-300"
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