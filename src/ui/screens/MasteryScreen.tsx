import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { TopBar } from '../components/TopBar';
import { ACTIVE_CONCEPTS, checkReadiness } from '../../core/mastery/readiness';
import { CONCEPT_NAMES } from '../../core/mastery/callout';
import { getMasteryBand } from '../../core/mastery/update';

interface MasteryScreenProps {
  navigation: any;
}

export function MasteryScreen({ navigation }: MasteryScreenProps) {
  const themeMode = useUserStore((s) => s.theme);
  const masteryMap = useUserStore((s) => s.mastery);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const readiness = checkReadiness(masteryMap);

  // Find lowest score among active concepts
  const scores = ACTIVE_CONCEPTS.map((cid) => masteryMap[cid]?.score ?? 0);
  const minScore = Math.min(...scores);
  // Mark the concept with the lowest score (first one if tied)
  const lowestConceptId = ACTIVE_CONCEPTS.find(
    (cid) => (masteryMap[cid]?.score ?? 0) === minScore
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Title (Without "You're strongest..." subtitle) */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Skill Mastery</Text>
        </View>

        {/* Program Readiness Announcement Banner */}
        <View
          style={[
            styles.announcementCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              borderBottomColor: colors.primaryLip,
            },
          ]}
        >
          <View style={styles.announcementTopRow}>
            <View
              style={[
                styles.readyStatusPill,
                {
                  backgroundColor: readiness.isReady
                    ? 'rgba(45, 184, 76, 0.16)'
                    : colors.surface2,
                  borderColor: readiness.isReady ? colors.success : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.readyStatusPillText,
                  { color: readiness.isReady ? colors.success : colors.text },
                ]}
              >
                {readiness.readyCount} / {readiness.totalActive} Skills Ready
              </Text>
            </View>
          </View>

          <Text style={[styles.announcementTitle, { color: colors.text }]}>
            Program Readiness
          </Text>
          <Text style={[styles.announcementCaption, { color: colors.textMuted }]}>
            {readiness.isReady
              ? 'Outstanding! You have demonstrated 70%+ mastery across all core concepts and are ready to build real projects.'
              : 'Reach 70%+ mastery in every skill to be ready to construct full programs with confidence.'}
          </Text>
        </View>

        {/* Skill Bars */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Concepts</Text>
        <View style={styles.skillsList}>
          {ACTIVE_CONCEPTS.map((cid) => {
            const record = masteryMap[cid];
            const band = getMasteryBand(record);
            const scorePercent = Math.min(100, Math.max(0, record.score));
            const isLowest = cid === lowestConceptId;

            let barColor = colors.surface2;
            if (band.band === 'needs_work') barColor = colors.error;
            else if (band.band === 'getting_there') barColor = colors.warn;
            else if (band.band === 'strong') barColor = colors.success;

            return (
              <View
                key={cid}
                style={[
                  styles.skillRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isLowest ? '#F59E0B' : colors.surface2,
                    borderWidth: isLowest ? 2 : 1.5,
                    borderBottomWidth: isLowest ? 5 : 2,
                    borderBottomColor: isLowest ? '#D97706' : colors.surface2,
                  },
                ]}
              >
                <View style={styles.skillHeader}>
                  <View style={styles.skillTitleGroup}>
                    <Text style={[styles.skillName, { color: colors.text }]}>
                      {CONCEPT_NAMES[cid]}
                    </Text>
                    {isLowest && (
                      <View style={styles.needsAttentionTag}>
                        <AlertTriangle size={11} color="#B45309" strokeWidth={2.8} />
                        <Text style={styles.needsAttentionTagText}>NEEDS ATTENTION</Text>
                      </View>
                    )}
                  </View>

                  {/* Percentage-based Score */}
                  <View style={styles.scorePill}>
                    <Text style={[styles.skillScore, { color: barColor }]}>
                      {Math.round(scorePercent)}%
                    </Text>
                    <Text style={[styles.skillBand, { color: colors.textMuted }]}>
                      • {band.label}
                    </Text>
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
    marginTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  /* Announcement Type Banner */
  announcementCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 10,
  },
  announcementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  announcementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  announcementBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  readyStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  readyStatusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  announcementTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  announcementCaption: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* Active Concepts */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 6,
  },
  skillsList: {
    gap: 12,
  },
  skillRow: {
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '800',
  },
  needsAttentionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  needsAttentionTagText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillScore: {
    fontSize: 16,
    fontWeight: '900',
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
