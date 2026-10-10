import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * Official Real JavaScript Logo (Vector SVG from devicon / official spec)
 * Yellow square shield with authentic JS lettering
 */
export function JavaScriptLogo({ size = 56 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      {/* Official JS Yellow Background with rounded corners */}
      <Rect
        x="2"
        y="2"
        width="124"
        height="124"
        rx="18"
        fill="#F7DF1E"
      />
      {/* Authentic JS Typography Paths */}
      <Path
        fill="#000000"
        d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"
      />
    </Svg>
  );
}

/**
 * Official Real Python Logo (Vector SVG from devicon / Python Software Foundation)
 * Dual intertwined snakes with rich authentic gradients
 */
export function PythonLogo({ size = 56 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <Defs>
        <LinearGradient id="pyGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#387EB8" />
          <Stop offset="100%" stopColor="#366994" />
        </LinearGradient>
        <LinearGradient id="pyGradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE873" />
          <Stop offset="100%" stopColor="#FFD43B" />
        </LinearGradient>
      </Defs>

      <G transform="translate(0, 4)">
        {/* Top Blue Snake */}
        <Path
          fill="url(#pyGradBlue)"
          d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"
        />

        {/* Bottom Yellow Snake */}
        <Path
          fill="url(#pyGradYellow)"
          d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"
        />
      </G>
    </Svg>
  );
}

/**
 * Large 3D Hero Logo for JavaScript (With realistic shadow, preserving exact dimensions)
 */
export function JavaScriptHeroLogo({ size = 136 }: { size?: number }) {
  return (
    <View style={[styles.heroLogoWrapper, { width: size, height: size }]}>
      <View style={[styles.logo3DShadow, { width: size, height: size }]}>
        <JavaScriptLogo size={size} />
      </View>
    </View>
  );
}

/**
 * Large 3D Hero Logo for Python (With realistic shadow, preserving exact dimensions)
 */
export function PythonHeroLogo({ size = 136 }: { size?: number }) {
  return (
    <View style={[styles.heroLogoWrapper, { width: size, height: size }]}>
      <View style={[styles.logo3DShadow, { width: size, height: size }]}>
        <PythonLogo size={size} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo3DShadow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
});
