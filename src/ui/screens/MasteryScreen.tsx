import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { TopBar } from '../components/TopBar';
import { ACTIVE_CONCEPTS, checkReadiness } from '../../core/mastery/readiness';
import { CONCEPT_NAMES, getHeaderSummary, getWeakestConceptCallout } from '../../core/mastery/callout';
import { getMasteryBand } from '../../core/mastery/update';
import { READY_THRESHOLD } from '../../config/constants';
import { PROBLEMS } from '../../content/data';

interface MasteryScreenProps {
  navigation: any;
}

export function MasteryScreen({ navigation }: MasteryScreenProps) {
  const themeMode = useUserStore((s) => s.theme);
  const masteryMap = useUserStore((s) => s.mastery);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const headerSummary = getHeaderSummary(masteryMap);
  const weakestCallout = getWeakestConceptCallout(masteryMap);
  const readiness = checkReadiness(masteryMap);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header Summary */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Skill Mastery</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{headerSummary.headline}</Text>
        </View>

        {/* Weakest Concept Callout */}
        {weakestCallout && (
          <View style={[styles.weakestCard, { backgroundColor: colors.surface, borderColor: colors.warn }]}>
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, { backgroundColor: colors.warn, color: '#FFFFFF' }]}>
                NEEDS ATTENTION
              </Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={[styles.weakestConcept, { color: colors.text }]}>
                {weakestCallout.conceptName}
              </Text>
              <Text style={[styles.weakestScore, { color: colors.warn }]}>
                {weakestCallout.displayScore}
              </Text>
            </View>
            <Text style={[styles.adviceText, { color: colors.textMuted }]}>{weakestCallout.advice}</Text>

            <TouchableOpacity
              style={[styles.practiceBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                const nextProb = PROBLEMS.find((p) => p.primaryConcept === weakestCallout.conceptId);
                if (nextProb) {
                  navigation.navigate('Problem', { problemId: nextProb.id });
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.practiceBtnText}>Practice {weakestCallout.conceptName}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Readiness Tracker */}
        <View style={[styles.readyCard, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}>
          <View style={styles.readyHeader}>
            <Text style={[styles.readyTitle, { color: colors.text }]}>Program Readiness</Text>
            <Text
              style={[
                styles.readyStatus,
                { color: readiness.isReady ? colors.success : colors.textMuted },
              ]}
            >
              {readiness.readyCount} / {readiness.totalActive} skills ready
            </Text>
          </View>
          <Text style={[styles.readyCaption, { color: colors.textMuted }]}>
            Reach {(READY_THRESHOLD / 10).toFixed(1)}+ in every skill to be ready to build a real program.
          </Text>
        </View>

        {/* Skill Bars */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Concepts</Text>
        <View style={styles.skillsList}>
          {ACTIVE_CONCEPTS.map((cid) => {
            const record = masteryMap[cid];
            const band = getMasteryBand(record);
            const scorePercent = Math.min(100, Math.max(0, record.score));

            let barColor = colors.surface2;
            if (band.band === 'needs_work') barColor = colors.error;
            else if (band.band === 'getting_there') barColor = colors.warn;
            else if (band.band === 'strong') barColor = colors.success;

            return (
              <View
                key={cid}
                style={[styles.skillRow, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
              >
                <View style={styles.skillHeader}>
                  <Text style={[styles.skillName, { color: colors.text }]}>{CONCEPT_NAMES[cid]}</Text>
                  <View style={styles.scorePill}>
                    <Text style={[styles.skillScore, { color: barColor }]}>{band.displayScore}</Text>
                    <Text style={[styles.skillBand, { color: colors.textMuted }]}>• {band.label}</Text>
                  </View>
                </View>

                {/* Progress Bar with ready marker */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.surface2 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${scorePercent}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                  {/* Ready Threshold Marker (70%) */}
                  <View style={[styles.readyMarker, { left: '70%' }]} />
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
    paddingBottom: 40,
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
  weakestCard: {
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
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  weakestConcept: {
    fontSize: 20,
    fontWeight: '800',
  },
  weakestScore: {
    fontSize: 22,
    fontWeight: '900',
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  practiceBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  practiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  readyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  readyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  readyStatus: {
    fontSize: 13,
    fontWeight: '800',
  },
  readyCaption: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  skillsList: {
    gap: 10,
  },
  skillRow: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 16,
    fontWeight: '700',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  skillBand: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  readyMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#000000',
    opacity: 0.3,
  },
});
