import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trophy, Flame, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { PROBLEMS } from '../../content/data';
import { recommendNext, getCoachTemplate } from '../../core/mastery/recommend';
import { CONCEPT_NAMES } from '../../core/mastery/callout';

interface CompletionScreenProps {
  route: any;
  navigation: any;
}

export function CompletionScreen({ route, navigation }: CompletionScreenProps) {
  const { problemId, xpAwarded, leveledUp, newLevel } = route.params;
  const problem = PROBLEMS.find((p) => p.id === problemId) ?? PROBLEMS[0];

  const themeMode = useUserStore((s) => s.theme);
  const completedProblems = useUserStore((s) => s.completedProblems);
  const masteryMap = useUserStore((s) => s.mastery);
  const struggles = useUserStore((s) => s.consecutiveStruggles);
  const streak = useUserStore((s) => s.streak.currentStreak);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const conceptRecord = masteryMap[problem.primaryConcept];
  const conceptName = CONCEPT_NAMES[problem.primaryConcept];

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
      <View style={styles.content}>
        <View style={styles.trophyWrapper}>
          <Trophy color={colors.xp} size={64} strokeWidth={2.4} />
        </View>
        <Text style={[styles.heading, { color: colors.text }]}>Problem Solved!</Text>
        <Text style={[styles.subheading, { color: colors.textMuted }]}>
          Great work completing {problem.title}.
        </Text>

        {/* Level Up Banner if applicable */}
        {leveledUp && (
          <View style={[styles.levelUpBanner, { backgroundColor: colors.primary }]}>
            <Sparkles color="#FFFFFF" size={16} strokeWidth={2.6} />
            <Text style={styles.levelUpText}>LEVEL UP! YOU ARE NOW LEVEL {newLevel}</Text>
            <Sparkles color="#FFFFFF" size={16} strokeWidth={2.6} />
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.xp }]}>
            <Text style={[styles.statVal, { color: colors.xp }]}>+{xpAwarded} XP</Text>
            <Text style={[styles.statName, { color: colors.textMuted }]}>Earned</Text>
          </View>

          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.streak }]}>
            <View style={styles.streakRow}>
              <Flame size={18} color={colors.streak} strokeWidth={2.4} />
              <Text style={[styles.statVal, { color: colors.streak }]}>{streak}</Text>
            </View>
            <Text style={[styles.statName, { color: colors.textMuted }]}>Day Streak</Text>
          </View>

          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.success }]}>
            <Text style={[styles.statVal, { color: colors.success }]}>
              {(conceptRecord.score / 10).toFixed(1)}/10
            </Text>
            <Text style={[styles.statName, { color: colors.textMuted }]}>{conceptName}</Text>
          </View>
        </View>

        {/* Next Up Coach Card */}
        {rec.problem && (
          <View style={[styles.nextCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
            <Text style={[styles.nextLabel, { color: colors.primary }]}>COACH SAYS</Text>
            <Text style={[styles.coachText, { color: colors.text }]}>{coachMessage}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
        {rec.problem ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.replace('Problem', { problemId: rec.problem!.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Next Problem</Text>
            <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.6} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.surface2 }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Learn' })}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Back to Roadmap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  trophyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  levelUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 4,
  },
  levelUpText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
    width: '100%',
  },
  statBadge: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  statName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nextCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coachText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontWeight: '800',
    fontSize: 15,
  },
});
