import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * Official JavaScript Logo (Crisp Vector SVG)
 */
export function JavaScriptLogo({ size = 56 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Golden Yellow Rounded Shield */}
      <Rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="18"
        fill="#F7DF1E"
      />
      {/* Subtle Inner Highlight Rim */}
      <Rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="16.5"
        fill="none"
        stroke="#E5C700"
        strokeWidth="2"
      />
      {/* J */}
      <Path
        d="M26 36 L39 36 L39 74 C39 81 33 87 23 87 C14 87 8 81 5 74 L16 67 C17 71 19 75 23 75 C26 75 28 73 28 69 L28 36 Z"
        fill="#18181B"
      />
      {/* S */}
      <Path
        d="M48 74 L59 67 C63 73 67 76 74 76 C79 76 83 73 83 69 C83 65 79 63 73 61 C63 57 52 53 52 42 C52 33 60 26 72 26 C80 26 87 30 92 37 L82 44 C79 39 75 37 72 37 C67 37 64 39 64 42 C64 46 67 48 74 50 C85 55 95 59 95 70 C95 80 87 87 74 87 C63 87 54 81 48 74 Z"
        fill="#18181B"
      />
    </Svg>
  );
}

/**
 * Official Python Logo (Dual Intertwined Snakes Vector SVG)
 */
export function PythonLogo({ size = 56 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      {/* Top Snake - Blue */}
      <Path
        d="M 63.5 12 C 45 12 34 22 34 33 L 34 44 L 64 44 L 64 49 L 23 49 C 12 49 3 58 3 70 C 3 83 13 91 24 91 L 32 91 L 32 78 C 32 66 42 56 54 56 L 85 56 C 94 56 101 49 101 40 L 101 29 C 101 18 92 12 79 12 L 63.5 12 Z"
        fill="#3776AB"
      />
      {/* Top Snake Eye */}
      <Circle cx="50" cy="28" r="5" fill="#FFFFFF" />

      {/* Bottom Snake - Yellow */}
      <Path
        d="M 64.5 116 C 83 116 94 106 94 95 L 94 84 L 64 84 L 64 79 L 105 79 C 116 79 125 70 125 58 C 125 45 115 37 104 37 L 96 37 L 96 50 C 96 62 86 72 74 72 L 43 72 C 34 72 27 79 27 88 L 27 99 C 27 110 36 116 49 116 L 64.5 116 Z"
        fill="#FFD43B"
      />
      {/* Bottom Snake Eye */}
      <Circle cx="78" cy="100" r="5" fill="#FFFFFF" />
    </Svg>
  );
}

/**
 * Large Centered Hero Logo for JavaScript
 */
export function JavaScriptHeroLogo({ size = 130 }: { size?: number }) {
  return (
    <View style={styles.heroLogoWrapper}>
      <View style={[styles.logoCard, styles.jsCardGlow, { width: size + 36, height: size + 36 }]}>
        <JavaScriptLogo size={size} />
      </View>
    </View>
  );
}

/**
 * Large Centered Hero Logo for Python
 */
export function PythonHeroLogo({ size = 130 }: { size?: number }) {
  return (
    <View style={styles.heroLogoWrapper}>
      <View style={[styles.logoCard, styles.pyCardGlow, { width: size + 36, height: size + 36 }]}>
        <PythonLogo size={size} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  logoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(24, 24, 27, 0.08)',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  jsCardGlow: {
    borderColor: 'rgba(247, 223, 30, 0.4)',
  },
  pyCardGlow: {
    borderColor: 'rgba(55, 118, 171, 0.25)',
  },
});
