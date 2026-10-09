import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const themeMode = useUserStore((s) => s.theme);
  const totalXp = useUserStore((s) => s.totalXp);
  const level = useUserStore((s) => s.level);
  const streak = useUserStore((s) => s.streak.currentStreak);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const safeTop = Math.max(insets.top, androidBarHeight, 44);
  const topPadding = safeTop + 8;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.surface2,
          paddingTop: topPadding,
        },
      ]}
    >
      {/* Streak */}
      <View style={styles.item}>
        <Text style={styles.icon}>🔥</Text>
        <Text style={[styles.value, { color: colors.streak }]}>{streak}</Text>
      </View>

      {/* XP */}
      <View style={styles.item}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={[styles.value, { color: colors.xp }]}>{totalXp}</Text>
      </View>

      {/* Level */}
      <View style={[styles.levelPill, { backgroundColor: colors.primary }]}>
        <Text style={styles.levelText}>LVL {level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 18,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
