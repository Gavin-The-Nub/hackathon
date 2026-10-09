import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { TopBar } from '../components/TopBar';
import { PROBLEMS } from '../../content/data';
import { recommendNext, getCoachTemplate } from '../../core/mastery/recommend';
import { CONCEPT_NAMES } from '../../core/mastery/callout';

interface PracticeScreenProps {
  navigation: any;
}

export function PracticeScreen({ navigation }: PracticeScreenProps) {
  const themeMode = useUserStore((s) => s.theme);
  const completedProblems = useUserStore((s) => s.completedProblems);
  const masteryMap = useUserStore((s) => s.mastery);
  const struggles = useUserStore((s) => s.consecutiveStruggles);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const rec = recommendNext({
    unlockedProblems: PROBLEMS,
    completedProblemIds: completedProblems,
    masteryMap,
    consecutiveStruggles: struggles,
  });

  const coachMessage = getCoachTemplate(
    rec.reason,
    rec.targetConcept ? CONCEPT_NAMES[rec.targetConcept] : undefined
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Practice Gym</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Master your coding foundations with targeted practice.
          </Text>
        </View>

        {/* Recommended Card */}
        {rec.problem && (
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, { backgroundColor: colors.primary, color: '#FFFFFF' }]}>
                RECOMMENDED FOR YOU
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{rec.problem.title}</Text>
            <Text style={[styles.heroCoach, { color: colors.textMuted }]}>{coachMessage}</Text>

            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Problem', { problemId: rec.problem!.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.heroBtnText}>Practice Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Practice List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Unlocked Problems</Text>
        <View style={styles.list}>
          {PROBLEMS.slice(0, 10).map((prob) => {
            const isDone = completedProblems.has(prob.id);
            return (
              <TouchableOpacity
                key={prob.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
                onPress={() => navigation.navigate('Problem', { problemId: prob.id })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.itemConcept, { color: colors.primary }]}>
                    {CONCEPT_NAMES[prob.primaryConcept]}
                  </Text>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{prob.title}</Text>
                </View>
                {isDone ? (
                  <Text style={[styles.doneBadge, { color: colors.success }]}>✓ Done</Text>
                ) : (
                  <Text style={[styles.arrow, { color: colors.textMuted }]}>→</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroCoach: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  itemConcept: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  doneBadge: {
    fontSize: 13,
    fontWeight: '800',
  },
  arrow: {
    fontSize: 18,
    fontWeight: '700',
  },
});
