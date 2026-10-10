import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { TopBar } from '../components/TopBar';
import { FixedStreakBadge } from '../components/FixedStreakBadge';
import { PROBLEMS } from '../../content/data';
import { recommendNext } from '../../core/mastery/recommend';
import { ConceptId } from '../../core/types';
import { BookOpen, Lock, Trophy, Star } from 'lucide-react-native';

interface LearnScreenProps {
  navigation: any;
}

interface UnitConfig {
  concept: ConceptId;
  unitNumber: number;
  title: string;
  subtitle: string;
  themeColor: string;
  lipColor: string;
  badge: string;
}

const UNITS: UnitConfig[] = [
  {
    concept: 'variables_types',
    unitNumber: 1,
    title: 'Variables & Math',
    subtitle: 'Store values, compute math & return answers',
    themeColor: '#34D399', // Pastel Mint
    lipColor: '#10B981',
    badge: 'UNIT 1',
  },
  {
    concept: 'conditionals',
    unitNumber: 2,
    title: 'Conditionals',
    subtitle: 'Branch decisions with if, else & boolean logic',
    themeColor: '#818CF8', // Pastel Periwinkle
    lipColor: '#6366F1',
    badge: 'UNIT 2',
  },
  {
    concept: 'loops',
    unitNumber: 3,
    title: 'Loops & Iteration',
    subtitle: 'Repeat operations with while & for loops',
    themeColor: '#FBBF24', // Pastel Warm Amber
    lipColor: '#F59E0B',
    badge: 'UNIT 3',
  },
  {
    concept: 'functions',
    unitNumber: 4,
    title: 'Functions & Scope',
    subtitle: 'Encapsulate reusable logic and arguments',
    themeColor: '#38BDF8', // Pastel Sky
    lipColor: '#0284C7',
    badge: 'UNIT 4',
  },
  {
    concept: 'arrays_lists',
    unitNumber: 5,
    title: 'Arrays & Lists',
    subtitle: 'Collect, inspect and transform lists of data',
    themeColor: '#F472B6', // Pastel Rose
    lipColor: '#DB2777',
    badge: 'UNIT 5',
  },
];

// Serpentine lateral offsets for the Duolingo winding path
const S_OFFSETS = [0, -52, -28, 30, 54];

export function LearnScreen({ navigation }: LearnScreenProps) {
  const themeMode = useUserStore((s) => s.theme);
  const completedProblems = useUserStore((s) => s.completedProblems);
  const masteryMap = useUserStore((s) => s.mastery);
  const struggles = useUserStore((s) => s.consecutiveStruggles);
  const selectedLanguage = useUserStore((s) => s.selectedLanguage);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  // Gentle floating bob animation for the Duolingo speech bubble
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounceAnim]);

  // Active language problems
  const languageProblems = PROBLEMS.filter((p) => p.language === selectedLanguage);

  // Compute recommendation for next step
  const rec = recommendNext({
    unlockedProblems: languageProblems,
    completedProblemIds: completedProblems,
    masteryMap,
    consecutiveStruggles: struggles,
  });

  const handleLockedNodePress = () => {
    Alert.alert(
      'Lesson Locked',
      'Complete the earlier lessons in this path to unlock this step!',
      [{ text: 'Got it' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Duolingo Winding Lesson Path */}
        <View style={styles.pathContainer}>
          {UNITS.map((unit, unitIdx) => {
            const unitProblems = languageProblems.filter((p) => p.primaryConcept === unit.concept);
            const isUnitUnlocked =
              unitIdx === 0 ||
              languageProblems.filter((p) => p.primaryConcept === UNITS[unitIdx - 1].concept).some((p) =>
                completedProblems.has(p.id)
              );

            const masteryScore = (masteryMap[unit.concept]?.score || 0) / 10;
            const completedInUnit = unitProblems.filter((p) => completedProblems.has(p.id)).length;
            const isUnitFullyCompleted =
              completedInUnit === unitProblems.length && unitProblems.length > 0;

            return (
              <View key={unit.concept} style={styles.unitSection}>
                {/* Duolingo Unit Header Banner */}
                <View
                  style={[
                    styles.unitBanner,
                    {
                      backgroundColor: isUnitUnlocked ? unit.themeColor : colors.surface2,
                      borderBottomColor: isUnitUnlocked ? unit.lipColor : colors.surface,
                    },
                  ]}
                >
                  <View style={styles.unitBannerTopRow}>
                    <View style={styles.unitBadgePill}>
                      <Text style={styles.unitBadgeText}>{unit.badge}</Text>
                    </View>
                    <View style={styles.masteryPill}>
                      <Text style={styles.masteryText}>
                        {completedInUnit}/{unitProblems.length} DONE · {masteryScore.toFixed(1)}/10
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>

                  {/* Mastery Progress Bar */}
                  <View style={styles.masteryBarTrack}>
                    <View
                      style={[
                        styles.masteryBarFill,
                        {
                          width: `${Math.min(100, Math.max(4, (masteryScore / 10) * 100))}%`,
                          backgroundColor: isUnitUnlocked ? '#FFFFFF' : colors.textMuted,
                        },
                      ]}
                    />
                  </View>

                  {/* Interactive Lesson Button on Banner */}
                  <TouchableOpacity
                    style={[
                      styles.unitLessonBtn,
                      {
                        backgroundColor: isUnitUnlocked ? 'rgba(255, 255, 255, 0.2)' : colors.surface,
                        borderColor: isUnitUnlocked ? 'rgba(255, 255, 255, 0.4)' : colors.surface2,
                      },
                    ]}
                    onPress={() => navigation.navigate('Lesson', { conceptId: unit.concept })}
                    activeOpacity={0.8}
                  >
                    <BookOpen size={16} color={isUnitUnlocked ? '#FFFFFF' : colors.text} strokeWidth={2.4} />
                    <Text style={[styles.unitLessonBtnText, { color: isUnitUnlocked ? '#FFFFFF' : colors.text }]}>
                      Read Lesson & Ask AI
                    </Text>
                    <Text style={[styles.unitLessonBtnArrow, { color: isUnitUnlocked ? '#FFFFFF' : colors.textMuted }]}>
                      →
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Stepping Stones Serpentine Path */}
                <View style={styles.stonesPath}>
                  {unitProblems.map((prob, probIdx) => {
                    const isCompleted = completedProblems.has(prob.id);
                    const isCurrent = rec.problem?.id === prob.id;

                    // Unlocked if completed, current, first problem of unlocked unit, or previous problem completed
                    const isUnlocked =
                      isCompleted ||
                      isCurrent ||
                      (probIdx === 0 && isUnitUnlocked) ||
                      (probIdx > 0 && completedProblems.has(unitProblems[probIdx - 1]?.id));

                    const isLocked = !isUnlocked;
                    const offsetX = S_OFFSETS[probIdx % S_OFFSETS.length];

                    return (
                      <View key={prob.id} style={styles.nodeWrapper}>
                        {/* Stepping Stone Container */}
                        <View
                          style={[
                            styles.steppingStoneRow,
                            { transform: [{ translateX: offsetX }] },
                          ]}
                        >
                          {/* Duolingo Floating Speech Bubble for Active Problem */}
                          {isCurrent && (
                            <Animated.View
                              style={[
                                styles.speechBubbleWrap,
                                { transform: [{ translateY: bounceAnim }] },
                              ]}
                            >
                              <View
                                style={[
                                  styles.speechBubble,
                                  { backgroundColor: unit.themeColor },
                                ]}
                              >
                                <Text style={styles.speechBubbleText}>START</Text>
                              </View>
                              <View
                                style={[
                                  styles.speechBubbleArrow,
                                  { borderTopColor: unit.themeColor },
                                ]}
                              />
                            </Animated.View>
                          )}

                          {/* Active Halo Glow */}
                          {isCurrent && (
                            <View
                              style={[
                                styles.currentHaloRing,
                                { borderColor: unit.themeColor },
                              ]}
                            />
                          )}

                          {/* Circular 3D Stepping Stone Button */}
                          <TouchableOpacity
                            style={[
                              styles.steppingStone,
                              {
                                backgroundColor: isCompleted
                                  ? unit.themeColor
                                  : isCurrent
                                  ? unit.themeColor
                                  : themeMode === 'dark'
                                  ? '#2A273D'
                                  : '#FFFFFF',
                                borderBottomColor: isCompleted
                                  ? unit.lipColor
                                  : isCurrent
                                  ? unit.lipColor
                                  : themeMode === 'dark'
                                  ? '#1C1A29'
                                  : '#C8C5D8',
                                borderColor: isCurrent
                                  ? '#FFFFFF'
                                  : isCompleted
                                  ? unit.lipColor
                                  : isUnlocked
                                  ? unit.themeColor
                                  : themeMode === 'dark'
                                  ? '#3F3B57'
                                  : '#D8D5E6',
                              },
                            ]}
                            disabled={isLocked}
                            onPress={
                              isLocked
                                ? handleLockedNodePress
                                : () => navigation.navigate('Problem', { problemId: prob.id })
                            }
                            activeOpacity={0.8}
                          >
                            {isCompleted ? (
                              <Text style={styles.stoneIcon}>✓</Text>
                            ) : isCurrent ? (
                              <Text style={styles.stoneIconPlay}>▶</Text>
                            ) : isUnlocked ? (
                              <Text
                                style={[
                                  styles.stoneIconNumber,
                                  { color: unit.themeColor },
                                ]}
                              >
                                {probIdx + 1}
                              </Text>
                            ) : (
                              <Lock size={20} color={themeMode === 'dark' ? '#7F7B99' : '#73708A'} strokeWidth={2.6} />
                            )}
                          </TouchableOpacity>

                          {/* Node Title & Completed Status Star */}
                          <View style={styles.nodeLabelWrap}>
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.nodeTitle,
                                { color: isLocked ? colors.textMuted : colors.text },
                                isCurrent && { color: unit.themeColor, fontWeight: '800' },
                              ]}
                            >
                              {prob.title}
                            </Text>
                            {isCompleted && (
                              <View style={styles.starBadgeWrap}>
                                <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={1} />
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Winding 3-Dot Stepping Trail to next node */}
                        {probIdx < unitProblems.length - 1 && (
                          <View style={styles.connectorDotsContainer}>
                            {[0.28, 0.55, 0.82].map((ratio, dIdx) => {
                              const nextOffset =
                                S_OFFSETS[(probIdx + 1) % S_OFFSETS.length];
                              const dotX = offsetX + (nextOffset - offsetX) * ratio;
                              return (
                                <View
                                  key={dIdx}
                                  style={[
                                    styles.connectorDot,
                                    {
                                      transform: [{ translateX: dotX }],
                                      backgroundColor: isCompleted
                                        ? unit.themeColor
                                        : colors.surface2,
                                      opacity: isCompleted ? 0.85 : 0.45,
                                    },
                                  ]}
                                />
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {/* Connecting trail from last node to Trophy milestone */}
                  <View style={styles.connectorDotsContainer}>
                    {[0.3, 0.6, 0.9].map((ratio, dIdx) => {
                      const lastOffset = S_OFFSETS[(unitProblems.length - 1) % S_OFFSETS.length];
                      const dotX = lastOffset + (0 - lastOffset) * ratio;
                      return (
                        <View
                          key={dIdx}
                          style={[
                            styles.connectorDot,
                            {
                              transform: [{ translateX: dotX }],
                              backgroundColor: isUnitFullyCompleted
                                ? '#F59E0B'
                                : colors.surface2,
                              opacity: isUnitFullyCompleted ? 0.9 : 0.45,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>

                  {/* Golden Unit Milestone Monument */}
                  <View style={styles.milestoneRow}>
                    <TouchableOpacity
                      style={styles.milestoneStone}
                      activeOpacity={0.85}
                    >
                      <Trophy size={28} color="#FFFFFF" strokeWidth={2.4} />
                    </TouchableOpacity>
                    <Text style={styles.milestoneLabel}>
                      {isUnitFullyCompleted ? 'Unit Mastered!' : 'Unit Milestone'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Day streak badge exclusively rendered on Learn page */}
      <FixedStreakBadge bottom={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 110,
  },

  /* Path Container */
  pathContainer: {
    gap: 36,
  },
  unitSection: {
    gap: 20,
  },

  /* Duolingo Unit Header Banner */
  unitBanner: {
    padding: 18,
    borderRadius: 22,
    borderBottomWidth: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  unitBannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  unitBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unitBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  masteryPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  masteryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  unitTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  unitSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  masteryBarTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  unitLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
    gap: 8,
  },
  unitLessonBtnIcon: {
    fontSize: 16,
  },
  unitLessonBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  unitLessonBtnArrow: {
    fontSize: 16,
    fontWeight: '800',
  },

  /* Stepping Stones Serpentine Path */
  stonesPath: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  nodeWrapper: {
    alignItems: 'center',
  },
  steppingStoneRow: {
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
  },

  /* Connector Trail Dots */
  connectorDotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 7,
  },
  connectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  /* Duolingo Floating Speech Bubble */
  speechBubbleWrap: {
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 10,
  },
  speechBubble: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  speechBubbleText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  speechBubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  /* Active Halo Ring */
  currentHaloRing: {
    position: 'absolute',
    top: -6,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    opacity: 0.35,
    zIndex: 1,
  },

  /* 3D Circular Stepping Stone */
  steppingStone: {
    width: 78,
    height: 74,
    borderRadius: 39,
    borderWidth: 2.5,
    borderBottomWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  stoneIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  stoneIconPlay: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginLeft: 4,
  },
  stoneIconNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  stoneIconLock: {
    fontSize: 22,
    opacity: 0.6,
  },

  /* Label under node */
  nodeLabelWrap: {
    alignItems: 'center',
    marginTop: 8,
    maxWidth: 160,
    gap: 4,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  starBadgeWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Golden Unit Milestone Monument */
  milestoneRow: {
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  milestoneStone: {
    width: 76,
    height: 72,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#F59E0B',
    borderWidth: 2.5,
    borderColor: '#FDE68A',
    borderBottomWidth: 8,
    borderBottomColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  milestoneLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.3,
  },
});
