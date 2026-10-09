import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { GenuineResult, Problem, RunResult } from '../../core/types';

interface ResultsSheetProps {
  problem: Problem;
  runResult: RunResult | null;
  genuineResult: GenuineResult | null;
  onExplainError: () => void;
  onTryAgain: () => void;
  onContinueAnyway: () => void;
  onContinuePassed: () => void;
}

export function ResultsSheet({
  problem,
  runResult,
  genuineResult,
  onExplainError,
  onTryAgain,
  onContinueAnyway,
  onContinuePassed,
}: ResultsSheetProps) {
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const [showImproveTip, setShowImproveTip] = useState(false);

  if (!runResult) return null;

  const isAllTestsPassed = runResult.status === 'tests_passed';
  const isNotGenuine = genuineResult?.label === 'CORRECT_NOT_GENUINE';

  const visiblePassedCount = runResult.visible.filter((t) => t.status === 'pass').length;
  const totalVisibleCount = runResult.visible.length;

  return (
    <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Status */}
        {isAllTestsPassed && !isNotGenuine && (
          <View style={styles.headerRow}>
            <Text style={styles.iconBig}>🎉</Text>
            <View>
              <Text style={[styles.title, { color: colors.success }]}>All tests passed!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Your solution is correct and verified.
              </Text>
            </View>
          </View>
        )}

        {isAllTestsPassed && isNotGenuine && (
          <View style={styles.headerRow}>
            <Text style={styles.iconBig}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.warn }]}>Almost there!</Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                {genuineResult?.reason === 'missing_construct'
                  ? `Your answers are right, but this problem asks you to use a ${problem.requiredConstructs.join(
                      ', '
                    )}. Give it a try!`
                  : "Your answers are right, but the loop isn't doing the work. Let the loop build the answer."}
              </Text>
            </View>
          </View>
        )}

        {!isAllTestsPassed && (
          <View style={styles.headerRow}>
            <Text style={styles.iconBig}>⚠️</Text>
            <View>
              <Text style={[styles.title, { color: colors.error }]}>
                {visiblePassedCount} of {totalVisibleCount} passed
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Keep going! Let's check where it differed.
              </Text>
            </View>
          </View>
        )}

        {/* First Failing Test Box */}
        {!isAllTestsPassed && runResult.firstFailing && (
          <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.boxLabel, { color: colors.textMuted }]}>
              {runResult.firstFailing.hidden ? 'A case we didn’t show:' : 'First failing test:'}
            </Text>
            <Text style={[styles.codeRow, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>Input: </Text>
              {JSON.stringify(runResult.firstFailing.args)}
            </Text>
            <Text style={[styles.codeRow, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>Expected: </Text>
              {JSON.stringify(runResult.firstFailing.expected)}
            </Text>
            <Text style={[styles.codeRow, { color: colors.error }]}>
              <Text style={{ fontWeight: '700' }}>You got: </Text>
              {runResult.firstFailing.actual !== null
                ? JSON.stringify(runResult.firstFailing.actual)
                : 'Error'}
            </Text>
          </View>
        )}

        {/* "Where I can improve" revealed tips */}
        {showImproveTip && isNotGenuine && (
          <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.boxLabel, { color: colors.primary }]}>Where you can improve:</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              {problem.prewrittenHints[1] || problem.conceptNote}
            </Text>
          </View>
        )}

        {/* Buttons / Actions */}
        <View style={styles.actions}>
          {isAllTestsPassed && !isNotGenuine && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success }]}
              onPress={onContinuePassed}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          )}

          {isAllTestsPassed && isNotGenuine && (
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={onTryAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>Try with required construct</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                onPress={() => setShowImproveTip(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                  Show where I can improve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textBtn}
                onPress={onContinueAnyway}
                activeOpacity={0.7}
              >
                <Text style={[styles.textBtnText, { color: colors.textMuted }]}>
                  Continue anyway (reduced XP)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isAllTestsPassed && (
            <View style={styles.failActionsRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.primary, flex: 1 }]}
                onPress={onExplainError}
                activeOpacity={0.8}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                  Explain my error
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={onTryAgain}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBig: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  box: {
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  codeRow: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 8,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontWeight: '800',
    fontSize: 15,
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  textBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  failActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
