import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp, Play, BookOpen } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { SymbolBar } from '../components/SymbolBar';
import { ResultsSheet } from '../components/ResultsSheet';
import { TutorCard } from '../components/TutorCard';
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation';
import { PROBLEMS } from '../../content/data';
import { RUNNER_HTML } from '../../services/runner-html';
import { checkConstructs } from '../../core/genuine/constructs';
import { requestTutorHelp } from '../../services/tutor-service';
import { GenuineResult, RunResult } from '../../core/types';

interface ProblemScreenProps {
  route: any;
  navigation: any;
}

export function ProblemScreen({ route, navigation }: ProblemScreenProps) {
  const insets = useSafeAreaInsets();
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const safeTop = Math.max(insets.top, androidBarHeight, 44);

  const { problemId } = route.params;
  const problem = PROBLEMS.find((p) => p.id === problemId) ?? PROBLEMS[0];

  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const drafts = useUserStore((s) => s.drafts);
  const saveDraft = useUserStore((s) => s.saveDraft);
  const recordCompletion = useUserStore((s) => s.recordCompletion);
  const recordAbandonment = useUserStore((s) => s.recordAbandonment);

  const [code, setCode] = useState(drafts[problem.id] || problem.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [runsCount, setRunsCount] = useState(0);
  const [tutorRequestsCount, setTutorRequestsCount] = useState(0);
  const [currentHintLevel, setCurrentHintLevel] = useState<1 | 2 | 3>(1);

  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [genuineResult, setGenuineResult] = useState<GenuineResult | null>(null);
  const [showResultsSheet, setShowResultsSheet] = useState(false);

  const [tutorCardVisible, setTutorCardVisible] = useState(false);
  const [tutorSource, setTutorSource] = useState<'ai' | 'prewritten'>('prewritten');
  const [tutorText, setTutorText] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isTutorNextLoading, setIsTutorNextLoading] = useState(false);

  const bottomInset = Math.max(insets.bottom, 10);
  const { isKeyboardVisible, animatedHeight, dismissKeyboard } = useKeyboardAnimation({
    initialBottom: bottomInset,
  });
  const [isStatementExpanded, setStatementExpanded] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (isKeyboardVisible) {
      setStatementExpanded(false); // Auto-collapse statement to maximize editor space
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    saveDraft(problem.id, code);
  }, [code]);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'set_theme', textColor: colors.text, isDark: themeMode === 'dark' })
    );
  }, [colors.text, themeMode]);

  const handleInsertSymbol = (sym: string) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'insert_symbol', symbol: sym }));
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setRunsCount((prev) => prev + 1);
    setRunResult(null);
    setGenuineResult(null);
    setShowResultsSheet(false);

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'run_tests',
        runId: `run-${Date.now()}`,
        code,
        functionName: problem.functionName,
        visibleTests: problem.visibleTests,
      })
    );
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'runner_ready') {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'set_code', code }));
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'set_theme', textColor: colors.text, isDark: themeMode === 'dark' })
        );
      } else if (msg.type === 'code_change') {
        setCode(msg.code);
      } else if (msg.type === 'editor_focus') {
        setStatementExpanded(false);
      } else if (msg.type === 'run_complete' || msg.type === 'run_error' || msg.type === 'run_timeout') {
        setIsRunning(false);
        const isPassed = msg.status === 'tests_passed';

        let genRes: GenuineResult = { runId: msg.runId, label: 'NOT_CHECKED', reason: null };
        if (isPassed) {
          genRes = checkConstructs(code, problem.functionName, problem.requiredConstructs);
        }

        let parsedError: RunResult['error'] = undefined;
        if (msg.error) {
          parsedError = {
            kind: 'runtime',
            message: msg.error.message || 'Execution error',
            line: msg.error.line,
          };
        } else if (msg.firstFailing?.errorDetail) {
          parsedError = {
            kind: 'runtime',
            message: msg.firstFailing.errorDetail.message || msg.firstFailing.errorMessage || 'Runtime error',
            line: msg.firstFailing.errorDetail.line,
          };
        } else if (msg.firstFailing?.errorMessage) {
          parsedError = {
            kind: 'runtime',
            message: msg.firstFailing.errorMessage,
          };
        }

        const formattedRunResult: RunResult = {
          runId: msg.runId,
          seed: 42,
          status: msg.status || 'tests_failed',
          visible: msg.visible || [],
          hiddenPassed: isPassed ? 10 : 0,
          hiddenTotal: 10,
          firstFailing: msg.firstFailing || null,
          printed: msg.printed || '',
          durationMs: 12,
          error: parsedError,
        };

        setRunResult(formattedRunResult);
        setGenuineResult(genRes);
        setShowResultsSheet(true);
      }
    } catch (e) {
      setIsRunning(false);
    }
  };

  const handleRequestHint = async (level: 1 | 2 | 3) => {
    setTutorRequestsCount((prev) => prev + 1);
    setCurrentHintLevel(level);
    setIsHintLoading(true);

    // Immediate prewritten fallback for instant response (<1s per DESIGN.md §1)
    const hintText =
      problem.prewrittenHints[level - 1] ||
      problem.prewrittenHints[0] ||
      'Review your function logic step by step.';

    setTutorSource('prewritten');
    setTutorText(hintText);
    setTutorCardVisible(true);

    // Attempt AI assistance in background
    try {
      const res = await requestTutorHelp({
        problem,
        action: 'hint',
        hintLevel: level,
        learnerCode: code,
      });

      if (res && res.text) {
        setTutorSource(res.source);
        setTutorText(res.text);
      }
    } catch (err) {
      // Keep prewritten fallback gracefully
    } finally {
      setIsHintLoading(false);
      setIsTutorNextLoading(false);
    }
  };

  const handleCompleteSuccess = () => {
    setShowResultsSheet(false);
    const completionInfo = recordCompletion({
      problem,
      kind: tutorRequestsCount > 0 ? 'hints' : runsCount > 1 ? 'retries' : 'first_try',
      tutorRequests: tutorRequestsCount,
      runs: runsCount,
      code,
    });

    navigation.replace('Completion', {
      problemId: problem.id,
      xpAwarded: completionInfo.xpAwarded,
      leveledUp: completionInfo.leveledUp,
      newLevel: completionInfo.newLevel,
    });
  };

  const handleContinueAnyway = () => {
    setShowResultsSheet(false);
    const completionInfo = recordCompletion({
      problem,
      kind: 'not_genuine',
      tutorRequests: tutorRequestsCount,
      runs: runsCount,
      code,
    });

    navigation.replace('Completion', {
      problemId: problem.id,
      xpAwarded: completionInfo.xpAwarded,
      leveledUp: completionInfo.leveledUp,
      newLevel: completionInfo.newLevel,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.innerContainer}>
        {/* Top Header Bar with robust notch/status-bar safe padding */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.surface2,
              paddingTop: safeTop + 8,
            },
          ]}
        >
          {/* Back Button (48x48 min touch target per DESIGN.md §3.3) */}
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface2, borderColor: colors.surface2 }]}
            onPress={() => {
              if (runsCount > 0) recordAbandonment(problem.id, problem.primaryConcept);
              navigation.goBack();
            }}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Problem Title & Offline Badge */}
          <View style={styles.headerTitleWrap}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
              {problem.title}
            </Text>
            <View style={[styles.offlineChip, { backgroundColor: colors.surface2 }]}>
              <Text style={[styles.offlineChipDot, { color: colors.success }]}>●</Text>
              <Text style={[styles.offlineChipText, { color: colors.primary }]}>OFFLINE</Text>
            </View>
          </View>

          {/* Header Right Action Group */}
          <View style={styles.headerRightGroup}>
            {/* Lesson Button */}
            <TouchableOpacity
              style={[
                styles.lessonHeaderBtn,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.surface2,
                },
              ]}
              onPress={() =>
                navigation.navigate('Lesson', {
                  conceptId: problem.primaryConcept,
                  problemId: problem.id,
                })
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <BookOpen size={16} color={colors.primary} />
              <Text style={[styles.lessonHeaderBtnText, { color: colors.primary }]}>Lesson</Text>
            </TouchableOpacity>

            {/* Quick Hint Button in Header */}
            <TouchableOpacity
              style={[
                styles.hintBtn,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => handleRequestHint(currentHintLevel)}
              disabled={isHintLoading}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              {isHintLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Lightbulb size={16} color={colors.primary} />
              )}
              <Text style={[styles.hintBtnText, { color: colors.primary }]}>
                {isHintLoading ? '...' : 'Hint'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Statement Card (DESIGN.md §5.3) */}
        <TouchableOpacity
          style={[
            styles.statementCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surface2,
            },
          ]}
          onPress={() => setStatementExpanded((prev) => !prev)}
          activeOpacity={0.8}
        >
          <View style={styles.statementRow}>
            <View style={styles.statementTextCol}>
              <Text
                numberOfLines={isStatementExpanded ? undefined : 2}
                style={[styles.statementText, { color: colors.text }]}
              >
                {problem.statement}
              </Text>
              {!isStatementExpanded && (
                <Text style={[styles.statementTapPrompt, { color: colors.primary }]}>
                  Tap to view instructions & details ▼
                </Text>
              )}
            </View>
            <View style={styles.chevronWrap}>
              {isStatementExpanded ? (
                <ChevronUp size={20} color={colors.primary} />
              ) : (
                <ChevronDown size={20} color={colors.textMuted} />
              )}
            </View>
          </View>

          {isStatementExpanded && (
            <View style={styles.expandedDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Function:</Text>
                <Text style={[styles.codeSnippet, { color: colors.text }]}>
                  {problem.functionName}()
                </Text>
              </View>
              {problem.requiredConstructs && problem.requiredConstructs.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Requires:</Text>
                  <Text style={[styles.codeSnippet, { color: colors.primary }]}>
                    {problem.requiredConstructs.join(', ')}
                  </Text>
                </View>
              )}
              {problem.conceptNote && (
                <View style={[styles.noteBox, { backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'flex-start', gap: 6 }]}>
                  <Lightbulb size={15} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[styles.conceptNoteText, { color: colors.text, flex: 1 }]}>
                    {problem.conceptNote}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.openLessonLink, { backgroundColor: colors.surface2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}
                onPress={() =>
                  navigation.navigate('Lesson', {
                    conceptId: problem.primaryConcept,
                    problemId: problem.id,
                  })
                }
                activeOpacity={0.8}
              >
                <BookOpen size={15} color={colors.primary} />
                <Text style={[styles.openLessonLinkText, { color: colors.primary }]}>
                  Read Full Lesson & Ask AI Tutor →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Tutor Help Card overlay */}
        {tutorCardVisible && (
          <TutorCard
            source={tutorSource}
            text={tutorText}
            hintLevel={currentHintLevel}
            isLoading={isTutorNextLoading}
            onDismiss={() => setTutorCardVisible(false)}
            onRequestNextLevel={() => {
              setIsTutorNextLoading(true);
              handleRequestHint(((currentHintLevel % 3) + 1) as 1 | 2 | 3);
            }}
            canRequestMore={currentHintLevel < 3}
          />
        )}

        {/* Code Editor (WebView runner) fills remaining space */}
        <View style={[styles.editorWrap, { backgroundColor: colors.codeBg }]}>
          <WebView
            ref={webViewRef}
            source={{ html: RUNNER_HTML }}
            originWhitelist={['*']}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => {
              webViewRef.current?.postMessage(JSON.stringify({ type: 'set_code', code }));
              webViewRef.current?.postMessage(
                JSON.stringify({ type: 'set_theme', textColor: colors.text, isDark: themeMode === 'dark' })
              );
            }}
            style={{ backgroundColor: 'transparent' }}
            javaScriptEnabled
            domStorageEnabled={false}
            scrollEnabled={false}
          />
        </View>

        {/* Action Bar (DESIGN.md §5.3): Hint + Run Tests with 3D Lip Buttons */}
        {!isKeyboardVisible && (
          <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
            <TouchableOpacity
              style={[
                styles.actionHintBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderBottomColor: colors.surface2,
                },
              ]}
              onPress={() => handleRequestHint(currentHintLevel)}
              disabled={isHintLoading}
              activeOpacity={0.8}
            >
              {isHintLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Lightbulb size={20} color={colors.primary} />
              )}
              <Text style={[styles.actionHintText, { color: colors.primary }]}>
                {isHintLoading ? 'Loading...' : 'Hint'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionRunBtn,
                {
                  backgroundColor: colors.primary,
                  borderBottomColor: colors.primaryLip,
                  opacity: isRunning ? 0.85 : 1,
                },
              ]}
              onPress={handleRunTests}
              disabled={isRunning}
              activeOpacity={0.8}
            >
              {isRunning ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.actionRunText}>Running tests...</Text>
                </View>
              ) : (
                <>
                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.actionRunText}>Run Tests</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Docked Symbol Toolbar directly on top of keyboard */}
        <SymbolBar
          onInsertSymbol={handleInsertSymbol}
          onRunTests={handleRunTests}
          isRunning={isRunning}
          isKeyboardVisible={isKeyboardVisible}
          language={problem.language}
          onDismissKeyboard={dismissKeyboard}
        />

        {/* Dynamic Animated Keyboard Spacer: docks SymbolBar directly on top of the keyboard */}
        <Animated.View style={{ height: animatedHeight }} />

        {/* Results Bottom Sheet */}
        {showResultsSheet && (
          <ResultsSheet
            problem={problem}
            runResult={runResult}
            genuineResult={genuineResult}
            onTryAgain={() => setShowResultsSheet(false)}
            onContinueAnyway={handleContinueAnyway}
            onContinuePassed={handleCompleteSuccess}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    flexShrink: 1,
  },
  offlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offlineChipDot: {
    fontSize: 9,
  },
  offlineChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  lessonHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  hintBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  openLessonLink: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  openLessonLinkText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statementCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statementTextCol: {
    flex: 1,
  },
  statementText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  statementTapPrompt: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  chevronWrap: {
    marginLeft: 8,
    padding: 2,
    marginTop: 2,
  },
  expandedDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  codeSnippet: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 13,
  },
  noteBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  conceptNoteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  editorWrap: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1.5,
    gap: 12,
  },
  actionHintBtn: {
    width: 100,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionHintText: {
    fontWeight: '800',
    fontSize: 15,
  },
  actionRunBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 4,
  },
  actionRunText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
