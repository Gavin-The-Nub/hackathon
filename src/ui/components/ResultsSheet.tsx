import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AlertTriangle, CheckCircle2, HelpCircle, Sparkles, Lightbulb } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { GenuineResult, Problem, RunResult } from '../../core/types';

interface ResultsSheetProps {
  problem: Problem;
  runResult: RunResult | null;
  genuineResult: GenuineResult | null;
  onTryAgain: () => void;
  onContinueAnyway: () => void;
  onContinuePassed: () => void;
}

export function ResultsSheet({
  problem,
  runResult,
  genuineResult,
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

  const firstFailing = runResult.firstFailing;
  const isRuntimeError = firstFailing?.status === 'error' || !!runResult.error;
  const rawErrorMessage = runResult.error?.message || firstFailing?.errorMessage || '';
  const errorLine = runResult.error?.line;

  // Diagnostic deduction
  let errorTitle = 'Execution Error';
  let errorExplanation = '';
  if (rawErrorMessage.includes('is not defined')) {
    errorTitle = 'ReferenceError: Undefined Variable';
    const varName = rawErrorMessage.match(/([a-zA-Z0-9_$]+) is not defined/)?.[1] || '';
    if (varName && problem.starterCode.includes(varName.slice(0, 3))) {
      errorExplanation = `Variable '${varName}' was referenced but not defined. Check if it was misspelled or intended to be one of the function arguments.`;
    } else {
      errorExplanation = `Variable '${varName}' was referenced before being declared. Declare it with 'let' or verify your parameter names.`;
    }
  } else if (rawErrorMessage.includes('Cannot read properties') || rawErrorMessage.includes('is not a function')) {
    errorTitle = 'TypeError';
    errorExplanation = 'Attempted an operation or property lookup on an undefined value. Check your object/array access or loop bounds.';
  } else if (rawErrorMessage.includes('Unexpected') || rawErrorMessage.includes('SyntaxError')) {
    errorTitle = 'SyntaxError';
    errorExplanation = 'Could not parse code. Check for unclosed brackets, missing quotes, or misplaced symbols.';
  } else if (!isRuntimeError && firstFailing) {
    if (firstFailing.actual === undefined || firstFailing.actual === null) {
      errorExplanation = `Your function returned ${String(firstFailing.actual)}. Did you forget to 'return' the calculated result?`;
    } else if (typeof firstFailing.actual !== typeof firstFailing.expected) {
      errorExplanation = `Type mismatch: expected ${typeof firstFailing.expected} but returned ${typeof firstFailing.actual}.`;
    } else {
      errorExplanation = `Calculated ${JSON.stringify(firstFailing.actual)} instead of expected ${JSON.stringify(firstFailing.expected)}. Check your arithmetic or boundary conditions.`;
    }
  }


  return (
    <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Status */}
        {isAllTestsPassed && !isNotGenuine && (
          <View style={styles.headerRow}>
            <CheckCircle2 size={32} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.success }]}>All tests passed!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Your solution is correct and verified.
              </Text>
            </View>
          </View>
        )}

        {isAllTestsPassed && isNotGenuine && (
          <View style={styles.headerRow}>
            <HelpCircle size={32} color={colors.warn} />
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
            <AlertTriangle size={32} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.error }]}>
                {visiblePassedCount} of {totalVisibleCount} tests passed
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {isRuntimeError
                  ? 'A runtime error occurred during test execution.'
                  : 'Output did not match expected result.'}
              </Text>
            </View>
          </View>
        )}

        {/* Detailed Error Diagnostic Card */}
        {!isAllTestsPassed && (isRuntimeError || rawErrorMessage) && (
          <View style={[styles.errorDiagnosticCard, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: colors.error }]}>
            <View style={styles.errorHeaderRow}>
              <View style={[styles.errorBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.errorBadgeText}>{errorTitle}</Text>
              </View>
              {errorLine ? (
                <View style={[styles.lineBadge, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.lineBadgeText, { color: colors.text }]}>Line {errorLine}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.errorMsgText, { color: colors.error }]}>
              {rawErrorMessage}
            </Text>
            {errorExplanation ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                <Lightbulb size={15} color={colors.warn} style={{ marginTop: 2 }} />
                <Text style={[styles.errorExplText, { color: colors.text, flex: 1 }]}>
                  {errorExplanation}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* First Failing Test Specification Box */}
        {!isAllTestsPassed && firstFailing && (
          <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.boxLabel, { color: colors.textMuted }]}>
              {firstFailing.hidden ? 'Hidden Test Case:' : 'Failing Test Case:'}
            </Text>
            <View style={styles.specRow}>
              <Text style={[styles.specKey, { color: colors.textMuted }]}>Call:</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>
                {problem.functionName}({firstFailing.args.map((a) => JSON.stringify(a)).join(', ')})
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={[styles.specKey, { color: colors.textMuted }]}>Expected:</Text>
              <Text style={[styles.specValue, { color: colors.success, fontWeight: '700' }]}>
                {JSON.stringify(firstFailing.expected)}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={[styles.specKey, { color: colors.textMuted }]}>Your Output:</Text>
              <Text style={[styles.specValue, { color: colors.error, fontWeight: '700' }]}>
                {firstFailing.actual !== null
                  ? JSON.stringify(firstFailing.actual)
                  : isRuntimeError
                  ? 'Threw error (see above)'
                  : 'null'}
              </Text>
            </View>
            {!isRuntimeError && errorExplanation ? (
              <Text style={[styles.diffNote, { color: colors.text }]}>
                {errorExplanation}
              </Text>
            ) : null}
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
    maxHeight: '65%',
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
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  errorDiagnosticCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  errorBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  lineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorMsgText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  errorExplText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  box: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  specKey: {
    fontSize: 13,
    fontWeight: '600',
    width: 90,
  },
  specValue: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  diffNote: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 6,
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
    fontSize: 14,
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
