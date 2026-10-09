import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

interface TutorCardProps {
  source: 'ai' | 'prewritten';
  text: string;
  hintLevel?: number;
  isLoading?: boolean;
  onDismiss: () => void;
  onRequestNextLevel?: () => void;
  canRequestMore?: boolean;
}

export function TutorCard({
  source,
  text,
  hintLevel,
  isLoading = false,
  onDismiss,
  onRequestNextLevel,
  canRequestMore,
}: TutorCardProps) {
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const isAi = source === 'ai';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.sparkle}>{isAi ? '✨' : '💡'}</Text>
          <View style={[styles.badge, { backgroundColor: isAi ? colors.primary : colors.surface2 }]}>
            <Text style={[styles.badgeText, { color: isAi ? '#FFFFFF' : colors.text }]}>
              {isAi ? 'On-Device AI Tutor' : 'Quick hint'}
            </Text>
          </View>
          {hintLevel !== undefined && (
            <Text style={[styles.levelLabel, { color: colors.textMuted }]}>
              Level {hintLevel}/3
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.bodyText, { color: colors.text }]}>{text}</Text>

      {canRequestMore && onRequestNextLevel && (
        <TouchableOpacity
          style={[styles.moreBtn, { backgroundColor: colors.surface2 }]}
          onPress={onRequestNextLevel}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.moreBtnText, { color: colors.primary }]}>Thinking...</Text>
            </View>
          ) : (
            <Text style={[styles.moreBtnText, { color: colors.primary }]}>
              Need more help? (Level {hintLevel! + 1})
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkle: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  moreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  moreBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
