import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Trophy, Flame, Shield, Sparkles, Award } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { MODEL_CONFIG } from '../../config/model';
import { JavaScriptLogo, PythonLogo } from '../components/LanguageLogos';

export function MeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const themeMode = useUserStore((s) => s.theme);
  const setTheme = useUserStore((s) => s.setTheme);
  const totalXp = useUserStore((s) => s.totalXp);
  const level = useUserStore((s) => s.level);
  const streak = useUserStore((s) => s.streak);
  const selectedLanguage = useUserStore((s) => s.selectedLanguage);
  const setSelectedLanguage = useUserStore((s) => s.setSelectedLanguage);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const topPadding = Math.max(insets.top, androidBarHeight, 44) + 16;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Trophy color="#FFFFFF" size={32} strokeWidth={2.4} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>LOCODE</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Offline Coding Gym</Text>
      </View>

      {/* Stats Row - Numbers inside icons, boxes removed */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconBadge,
              {
                backgroundColor: 'rgba(251, 146, 60, 0.14)',
                borderColor: 'rgba(251, 146, 60, 0.35)',
              },
            ]}
          >
            <Flame color={colors.streak} size={42} strokeWidth={1.8} style={styles.watermarkIcon} />
            <Text style={[styles.statNumberInside, { color: colors.streak }]}>{streak.currentStreak}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
        </View>

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconBadge,
              {
                backgroundColor: 'rgba(123, 115, 232, 0.14)',
                borderColor: 'rgba(123, 115, 232, 0.35)',
              },
            ]}
          >
            <Shield color={colors.primary} size={42} strokeWidth={1.8} style={styles.watermarkIcon} />
            <Text style={[styles.statNumberInside, { color: colors.primary }]}>{streak.freezesAvailable}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Freezes</Text>
        </View>

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconBadge,
              {
                backgroundColor: 'rgba(251, 191, 36, 0.14)',
                borderColor: 'rgba(251, 191, 36, 0.35)',
              },
            ]}
          >
            <Sparkles color={colors.xp} size={42} strokeWidth={1.8} style={styles.watermarkIcon} />
            <Text style={[styles.statNumberInside, { color: colors.xp }]}>{totalXp}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total XP</Text>
        </View>

        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconBadge,
              {
                backgroundColor: 'rgba(52, 211, 153, 0.14)',
                borderColor: 'rgba(52, 211, 153, 0.35)',
              },
            ]}
          >
            <Award color={colors.success} size={42} strokeWidth={1.8} style={styles.watermarkIcon} />
            <Text style={[styles.statNumberInside, { color: colors.success }]}>{level}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Level</Text>
        </View>
      </View>

      {/* Local AI Model Card */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>On-Device AI Tutor</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(45, 184, 76, 0.15)' }]}>
            <Text style={[styles.badgeText, { color: colors.success }]}>ACTIVE</Text>
          </View>
        </View>

        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Running locally via llama.rn. 100% offline, zero data leaves this device.
        </Text>

        <View style={[styles.metaRow, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Model</Text>
          <Text style={[styles.metaVal, { color: colors.text }]}>{MODEL_CONFIG.name}</Text>
        </View>
        <View style={[styles.metaRow, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Quantization</Text>
          <Text style={[styles.metaVal, { color: colors.text }]}>{MODEL_CONFIG.quant}</Text>
        </View>
        <View style={[styles.metaRow, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Size</Text>
          <Text style={[styles.metaVal, { color: colors.text }]}>
            {(MODEL_CONFIG.sizeBytes / 1000000).toFixed(0)} MB
          </Text>
        </View>
      </View>

      {/* Learning Track / Language Picker */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Track</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PathSelection')}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Change Track</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          Your current roadmap is set to {selectedLanguage === 'python' ? 'Python Basics' : 'JavaScript Foundations'}.
        </Text>

        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              {
                backgroundColor: selectedLanguage === 'javascript' ? colors.primary : colors.surface2,
                borderColor: selectedLanguage === 'javascript' ? colors.primaryLip : 'transparent',
                flexDirection: 'row',
                gap: 8,
              },
            ]}
            onPress={() => setSelectedLanguage('javascript')}
            activeOpacity={0.8}
          >
            <JavaScriptLogo size={18} />
            <Text
              style={[
                styles.themeBtnText,
                { color: selectedLanguage === 'javascript' ? '#FFFFFF' : colors.text },
              ]}
            >
              JavaScript
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeBtn,
              {
                backgroundColor: selectedLanguage === 'python' ? colors.primary : colors.surface2,
                borderColor: selectedLanguage === 'python' ? colors.primaryLip : 'transparent',
                flexDirection: 'row',
                gap: 8,
              },
            ]}
            onPress={() => setSelectedLanguage('python')}
            activeOpacity={0.8}
          >
            <PythonLogo size={18} />
            <Text
              style={[
                styles.themeBtnText,
                { color: selectedLanguage === 'python' ? '#FFFFFF' : colors.text },
              ]}
            >
              Python
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Picker */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

        <View style={styles.themeRow}>
          {(['system', 'light', 'dark'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeMode === t ? colors.primary : colors.surface2,
                  borderColor: themeMode === t ? colors.primaryLip : 'transparent',
                },
              ]}
              onPress={() => setTheme(t)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: themeMode === t ? '#FFFFFF' : colors.text },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statIconBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkIcon: {
    position: 'absolute',
    opacity: 0.2,
  },
  statNumberInside: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
