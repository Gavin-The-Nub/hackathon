import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { TopBar } from '../components/TopBar';
import { PROBLEMS } from '../../content/data';
import { recommendNext, getCoachTemplate } from '../../core/mastery/recommend';
import { CONCEPT_NAMES } from '../../core/mastery/callout';
import { ConceptId } from '../../core/types';

interface LearnScreenProps {
  navigation: any;
}

const STAGES: { concept: ConceptId; title: string }[] = [
  { concept: 'variables_types', title: '1. Variables & Math' },
  { concept: 'conditionals', title: '2. Conditionals' },
  { concept: 'loops', title: '3. Loops' },
  { concept: 'functions', title: '4. Functions' },
  { concept: 'arrays_lists', title: '5. Arrays & Lists' },
];

export function LearnScreen({ navigation }: LearnScreenProps) {
  const themeMode = useUserStore((s) => s.theme);
  const completedProblems = useUserStore((s) => s.completedProblems);
  const masteryMap = useUserStore((s) => s.mastery);
  const struggles = useUserStore((s) => s.consecutiveStruggles);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  // Compute recommendation
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
        {/* "Up Next" Card */}
        {rec.problem && (
          <View style={[styles.upNextCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.upNextHeader}>
              <Text style={[styles.upNextTag, { color: colors.primary }]}>⚡ UP NEXT</Text>
              <Text style={[styles.conceptTag, { color: colors.textMuted }]}>
                {CONCEPT_NAMES[rec.problem.primaryConcept]}
              </Text>
            </View>

            <Text style={[styles.upNextTitle, { color: colors.text }]}>{rec.problem.title}</Text>
            <Text style={[styles.coachText, { color: colors.textMuted }]}>{coachMessage}</Text>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Problem', { problemId: rec.problem!.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>Start Problem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Roadmap Stages */}
        <View style={styles.roadmap}>
          {STAGES.map((stage, stageIdx) => {
            const stageProblems = PROBLEMS.filter((p) => p.primaryConcept === stage.concept);
            const isStageUnlocked =
              stageIdx === 0 ||
              PROBLEMS.filter((p) => p.primaryConcept === STAGES[stageIdx - 1].concept).some((p) =>
                completedProblems.has(p.id)
              );

            return (
              <View key={stage.concept} style={styles.stageBlock}>
                <View style={styles.stageTitleRow}>
                  <Text style={[styles.stageTitle, { color: colors.text }]}>{stage.title}</Text>
                  <Text style={[styles.stageBadge, { color: isStageUnlocked ? colors.primary : colors.textMuted }]}>
                    {isStageUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </Text>
                </View>

                <View style={styles.problemsGrid}>
                  {stageProblems.map((prob) => {
                    const isCompleted = completedProblems.has(prob.id);
                    return (
                      <TouchableOpacity
                        key={prob.id}
                        style={[
                          styles.problemNode,
                          {
                            backgroundColor: isCompleted
                              ? colors.success
                              : isStageUnlocked
                              ? colors.surface
                              : colors.surface2,
                            borderColor: isCompleted ? colors.success : colors.surface2,
                          },
                        ]}
                        disabled={!isStageUnlocked}
                        onPress={() => navigation.navigate('Problem', { problemId: prob.id })}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.nodeIcon]}>{isCompleted ? '✓' : prob.order}</Text>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.nodeTitle,
                            { color: isCompleted ? '#FFFFFF' : isStageUnlocked ? colors.text : colors.textMuted },
                          ]}
                        >
                          {prob.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
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
  upNextCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    gap: 10,
  },
  upNextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upNextTag: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  conceptTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  upNextTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  coachText: {
    fontSize: 14,
    lineHeight: 20,
  },
  startBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  roadmap: {
    gap: 24,
  },
  stageBlock: {
    gap: 12,
  },
  stageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  stageBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  problemsGrid: {
    gap: 8,
  },
  problemNode: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  nodeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
    fontSize: 14,
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
});
