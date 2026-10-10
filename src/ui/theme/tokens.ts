export const LIGHT_THEME = {
  primary: '#7B73E8',      // Soft pastel periwinkle / lavender
  primaryLip: '#5D55D4',   // Pastel lip depth
  streak: '#FB923C',       // Pastel warm peach
  xp: '#FBBF24',           // Pastel butter yellow
  success: '#34D399',      // Pastel mint
  error: '#F87171',        // Pastel blush / coral
  warn: '#FCD34D',         // Pastel banana
  bg: '#FAF9FD',           // Soft clean tinted off-white
  surface: '#F2F0F9',      // Pastel surface
  surface2: '#E6E3F2',     // Pastel border/input surface
  text: '#1E1B2E',         // Deep legible body text
  textMuted: '#7E7A94',    // Pastel muted text
  codeBg: '#F6F5FA',       // Soft editor background
};

export const DARK_THEME = {
  primary: '#9B94FF',      // Pastel lilac / lavender glow
  primaryLip: '#7A72E8',   // Pastel lip depth
  streak: '#FDBA74',       // Soft pastel peach
  xp: '#FDE047',           // Pastel soft lemon
  success: '#6EE7B7',      // Pastel mint glow
  error: '#FCA5A5',        // Pastel strawberry glow
  warn: '#FDE047',         // Pastel warm glow
  bg: '#151322',           // Muted dark violet background
  surface: '#1F1C30',      // Soft dark card surface
  surface2: '#2D2944',     // Muted borders
  text: '#F4F3FA',         // Off-white text
  textMuted: '#A6A2BF',    // Muted purple text
  codeBg: '#110F1C',       // Editor background
};

export type ThemeTokens = typeof LIGHT_THEME;
