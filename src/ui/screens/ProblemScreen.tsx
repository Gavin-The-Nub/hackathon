import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { SymbolBar } from '../components/SymbolBar';
import { ResultsSheet } from '../components/ResultsSheet';
import { TutorCard } from '../components/TutorCard';
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

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    saveDraft(problem.id, code);
  }, [code]);

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
      } else if (msg.type === 'code_change') {
        setCode(msg.code);
      } else if (msg.type === 'run_complete' || msg.type === 'run_error' || msg.type === 'run_timeout') {
        setIsRunning(false);
        const isPassed = msg.status === 'tests_passed';

        let genRes: GenuineResult = { runId: msg.runId, label: 'NOT_CHECKED', reason: null };
        if (isPassed) {
          // Perform genuine construct verification with Acorn
          genRes = checkConstructs(code, problem.functionName, problem.requiredConstructs);
        }

        const formattedRunResult: RunResult = {
          runId: msg.runId,
          seed: 42,
          status: msg.status || 'error',
          visible: msg.visible || [],
          hiddenPassed: 0,
          hiddenTotal: 0,
          firstFailing: msg.firstFailing || null,
          printed: msg.printed || '',
          error: msg.error,
          durationMs: 150,
        };

        setRunResult(formattedRunResult);
        setGenuineResult(genRes);
        setShowResultsSheet(true);
      }
    } catch (e) {}
  };

  const handleRequestHint = async (level: 1 | 2 | 3) => {
    setCurrentHintLevel(level);
    setTutorRequestsCount((prev) => prev + 1);
    setTutorCardVisible(true);

    const res = await requestTutorHelp({
      problem,
      action: 'hint',
      hintLevel: level,
      failingTest: runResult?.firstFailing,
      error: runResult?.error,
      learnerCode: code,
      onToken: (_, fullText) => {
        setTutorSource('ai');
        setTutorText(fullText);
      },
    });

    setTutorSource(res.source);
    setTutorText(res.text);
  };

  const handleExplainError = async () => {
    setShowResultsSheet(false);
    setTutorRequestsCount((prev) => prev + 1);
    setTutorCardVisible(true);

    const res = await requestTutorHelp({
      problem,
      action: 'explain',
      failingTest: runResult?.firstFailing,
      error: runResult?.error,
      learnerCode: code,
      onToken: (_, fullText) => {
        setTutorSource('ai');
        setTutorText(fullText);
      },
    });

    setTutorSource(res.source);
    setTutorText(res.text);
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surface2 }]}>
        <TouchableOpacity
          onPress={() => {
            if (runsCount > 0) recordAbandonment(problem.id, problem.primaryConcept);
            navigation.goBack();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.backBtn, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
            {problem.title}
          </Text>
          <View style={[styles.offlineChip, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.offlineChipText, { color: colors.primary }]}>OFFLINE REF</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.hintBtn, { backgroundColor: colors.surface2 }]}
          onPress={() => handleRequestHint(currentHintLevel)}
          activeOpacity={0.7}
        >
          <Text style={[styles.hintBtnText, { color: colors.primary }]}>💡 Hint</Text>
        </TouchableOpacity>
      </View>

      {/* Statement Strip */}
      <View style={[styles.statementStrip, { backgroundColor: colors.surface, borderBottomColor: colors.surface2 }]}>
        <Text style={[styles.statementText, { color: colors.text }]}>{problem.statement}</Text>
      </View>

      {/* Tutor Help Card overlay */}
      {tutorCardVisible && (
        <TutorCard
          source={tutorSource}
          text={tutorText}
          hintLevel={currentHintLevel}
          onDismiss={() => setTutorCardVisible(false)}
          onRequestNextLevel={() => handleRequestHint(((currentHintLevel % 3) + 1) as 1 | 2 | 3)}
          canRequestMore={currentHintLevel < 3}
        />
      )}

      {/* Code Editor (WebView runner) */}
      <View style={[styles.editorWrap, { backgroundColor: colors.codeBg }]}>
        <WebView
          ref={webViewRef}
          source={{ html: RUNNER_HTML }}
          originWhitelist={['*']}
          onMessage={handleWebViewMessage}
          style={{ backgroundColor: 'transparent' }}
          javaScriptEnabled
          domStorageEnabled={false}
          scrollEnabled={false}
        />
      </View>

      {/* Floating Action / Run Bar */}
      <View style={[styles.runBar, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
        <TouchableOpacity
          style={[styles.runBtn, { backgroundColor: isRunning ? colors.textMuted : colors.primary }]}
          onPress={handleRunTests}
          disabled={isRunning}
          activeOpacity={0.8}
        >
          <Text style={styles.runBtnText}>{isRunning ? 'Running referee...' : '▶ Run Tests'}</Text>
        </TouchableOpacity>
      </View>

      {/* Symbol Toolbar above keyboard */}
      <SymbolBar onInsertSymbol={handleInsertSymbol} />

      {/* Results Bottom Sheet */}
      {showResultsSheet && (
        <ResultsSheet
          problem={problem}
          runResult={runResult}
          genuineResult={genuineResult}
          onExplainError={handleExplainError}
          onTryAgain={() => setShowResultsSheet(false)}
          onContinueAnyway={handleContinueAnyway}
          onContinuePassed={handleCompleteSuccess}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  offlineChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  hintBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  hintBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statementStrip: {
    padding: 12,
    borderBottomWidth: 1,
  },
  statementText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  editorWrap: {
    flex: 1,
  },
  runBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  runBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
