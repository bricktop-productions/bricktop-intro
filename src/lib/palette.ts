// bricktop-intro/src/lib/palette.ts
// Single source of truth for bricktop-productions color tokens

export const palette = {
  // Backgrounds
  brick950: '#1a1410',  // Primary background
  brick900: '#2a1f16',  // Elevated surfaces
  brick800: '#3d2f1f',  // Borders
  brick700: '#5c4a35',  // Muted text

  // Brand colors (warm)
  brickGold: '#ffb300',   // Primary - letter lock
  brickAmber: '#ff8f00',  // Secondary - particles
  brickOrange: '#e65100', // Tertiary - seal line
  brickCream: '#fdf6e3',  // Text - "productions"
  brickMuted: '#8d6e5c',  // Metadata

  // Semantic aliases
  background: '#1a1410',
  surface: '#2a1f16',
  border: '#3d2f1f',
  textPrimary: '#fdf6e3',
  textSecondary: '#8d6e5c',
  brandPrimary: '#ffb300',
  brandSecondary: '#ff8f00',
  brandAccent: '#e65100',
} as const;

export type PaletteKey = keyof typeof palette;

// CSS variable helpers for Remotion styles
export const cssVars = {
  '--brick-950': palette.brick950,
  '--brick-900': palette.brick900,
  '--brick-800': palette.brick800,
  '--brick-700': palette.brick700,
  '--brick-gold': palette.brickGold,
  '--brick-amber': palette.brickAmber,
  '--brick-orange': palette.brickOrange,
  '--brick-cream': palette.brickCream,
  '--brick-muted': palette.brickMuted,
} as const;

// RGBA helpers for opacity variations
export const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const paletteAlpha = {
  gold10: withAlpha(palette.brickGold, 0.1),
  gold20: withAlpha(palette.brickGold, 0.2),
  gold40: withAlpha(palette.brickGold, 0.4),
  amber10: withAlpha(palette.brickAmber, 0.1),
  amber20: withAlpha(palette.brickAmber, 0.2),
  orange20: withAlpha(palette.brickOrange, 0.2),
  cream10: withAlpha(palette.brickCream, 0.1),
  cream50: withAlpha(palette.brickCream, 0.5),
} as const;