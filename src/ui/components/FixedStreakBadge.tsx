import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Flame, X, Shield, Sparkles, Check } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

interface FixedStreakBadgeProps {
  bottom?: number;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function FixedStreakBadge({ bottom = 20 }: FixedStreakBadgeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const themeMode = useUserStore((s) => s.theme);
  const streak = useUserStore((s) => s.streak.currentStreak);
  const freezes = useUserStore((s) => s.streak.freezesAvailable);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0 ... Sunday = 6

  return (
    <>
      <View style={[styles.fixedContainer, { bottom }]} pointerEvents="box-none">
        <TouchableOpacity
          style={[
            styles.badge3D,
            {
              backgroundColor: colors.surface,
              borderColor: colors.streak,
              borderBottomColor: themeMode === 'dark' ? '#9A4A00' : '#CC6E00',
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.82}
          accessibilityLabel={`Current streak: ${streak} days`}
        >
          <Flame size={20} color={colors.streak} strokeWidth={2.6} />
          <Text style={[styles.streakCount, { color: colors.streak }]}>{streak}</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Day Streak Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surface2,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surface2 }]}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text} strokeWidth={2.8} />
            </TouchableOpacity>

            {/* Glowing Flame Emblem */}
            <View style={styles.flameCircle}>
              <Flame size={48} color="#FB923C" strokeWidth={2.5} />
            </View>

            {/* Modal Title & Copy */}
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {streak > 0 ? `${streak} Day Streak!` : 'Start Your Streak!'}
            </Text>

            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              {streak > 0
                ? 'Great momentum! Complete at least 1 lesson or practice problem daily to keep your flame blazing.'
                : 'Solve your first problem or read a lesson today to ignite your daily learning flame!'}
            </Text>

            {/* 7-Day Streak Tracker */}
            <View style={[styles.weekTracker, { backgroundColor: colors.surface2 }]}>
              {WEEKDAYS.map((day, idx) => {
                const isToday = idx === todayIndex;
                const isPastOrActive = idx <= todayIndex && streak > 0;
                return (
                  <View key={idx} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayLabel,
                        { color: isToday ? colors.streak : colors.textMuted },
                      ]}
                    >
                      {day}
                    </Text>
                    <View
                      style={[
                        styles.dayCircle,
                        isPastOrActive && { backgroundColor: '#FB923C' },
                        isToday && styles.todayCircleBorder,
                      ]}
                    >
                      {isPastOrActive ? (
                        <Flame size={12} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <View style={styles.dayDotEmpty} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Freezes Info Pill */}
            <View style={[styles.freezeRow, { backgroundColor: colors.surface2 }]}>
              <Shield size={18} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.freezeText, { color: colors.text }]}>
                {freezes} Streak Freeze{freezes === 1 ? '' : 's'} equipped
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: colors.streak }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.modalActionBtnText}>Keep Going!</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fixedContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 99,
    elevation: 8,
  },
  badge3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 146, 60, 0.18)',
    borderWidth: 2,
    borderColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  weekTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginBottom: 16,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircleBorder: {
    borderWidth: 2,
    borderColor: '#FB923C',
  },
  dayDotEmpty: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(120, 120, 120, 0.3)',
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  freezeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});

