import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { MODEL_CONFIG } from '../../config/model';

export function MeScreen() {
  const themeMode = useUserStore((s) => s.theme);
  const setTheme = useUserStore((s) => s.setTheme);
  const totalXp = useUserStore((s) => s.totalXp);
  const level = useUserStore((s) => s.level);
  const streak = useUserStore((s) => s.streak);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>🏆</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>CodeChamp</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Offline Coding Gym</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statVal, { color: colors.streak }]}>{streak.currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
          <Text style={styles.statIcon}>🛡️</Text>
          <Text style={[styles.statVal, { color: colors.primary }]}>{streak.freezesAvailable}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Freezes</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
          <Text style={styles.statIcon}>⚡</Text>
          <Text style={[styles.statVal, { color: colors.xp }]}>{totalXp}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total XP</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
          <Text style={styles.statIcon}>🎖️</Text>
          <Text style={[styles.statVal, { color: colors.primary }]}>{level}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Level</Text>
        </View>
      </View>

      {/* Local AI Model Card */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>On-Device AI Tutor</Text>
          <Text style={[styles.onlinePill, { color: colors.success, backgroundColor: colors.surface2 }]}>
            OFFLINE READY
          </Text>
        </View>
        <Text style={[styles.modelInfo, { color: colors.textMuted }]}>
          Model: {MODEL_CONFIG.name} ({MODEL_CONFIG.quant})
        </Text>
        <Text style={[styles.modelDesc, { color: colors.text }]}>
          Zero internet calls after install. Hints are generated locally on your phone CPU with llama.cpp.
        </Text>
      </View>

      {/* Theme Setting */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Theme</Text>
        <View style={styles.themeSelector}>
          {(['light', 'dark', 'system'] as const).map((t) => {
            const isSelected = themeMode === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface2,
                  },
                ]}
                onPress={() => setTheme(t)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.themeBtnText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 22,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  onlinePill: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modelInfo: {
    fontSize: 13,
    fontWeight: '600',
  },
  modelDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  themeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
