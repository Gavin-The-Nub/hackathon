import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  StatusBar as RNStatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  Play,
  Sparkles,
  RotateCcw,
  Terminal,
  Send,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Bot,
  Lightbulb,
  Keyboard as KeyboardIcon,
  Code2,
} from 'lucide-react-native';

import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { SymbolBar } from '../components/SymbolBar';
import { SANDBOX_RUNNER_HTML } from '../../services/sandbox-runner-html';
import { askSandboxTutor, SandboxTutorResponse } from '../../services/sandbox-tutor-service';
import { JavaScriptLogo, PythonLogo } from '../components/LanguageLogos';
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation';

interface SandboxScreenProps {
  navigation: any;
  route?: any;
}

interface ConsoleLogEntry {
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

const JS_TEMPLATES = [
  {
    label: 'Hello World',
    code: `// JavaScript Playground\nconst message = "Hello from LOCODE!";\nconsole.log(message);\n\nconst user = { role: "Developer", xp: 150 };\nconsole.log("Profile:", user);\nuser;`,
  },
  {
    label: 'Array Methods',
    code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8];\n\n// Filter even numbers & double them\nconst result = numbers\n  .filter(n => n % 2 === 0)\n  .map(n => n * 2);\n\nconsole.log("Filtered & Doubled:", result);\nresult;`,
  },
  {
    label: 'Fibonacci',
    code: `function fibonacci(n) {\n  const seq = [0, 1];\n  for (let i = 2; i < n; i++) {\n    seq.push(seq[i - 1] + seq[i - 2]);\n  }\n  return seq;\n}\n\nconst fib8 = fibonacci(8);\nconsole.log("Fibonacci:", fib8);\nf8 = fib8;`,
  },
  {
    label: 'Conditionals',
    code: `function gradeScore(score) {\n  if (score >= 90) return "A - Excellent";\n  if (score >= 80) return "B - Solid";\n  if (score >= 70) return "C - Passing";\n  return "Keep practicing!";\n}\n\nconsole.log("Score 85:", gradeScore(85));\nconsole.log("Score 94:", gradeScore(94));`,
  },
  {
    label: 'Blank Slate',
    code: `// Write your JavaScript code here!\n`,
  },
];

const PYTHON_TEMPLATES = [
  {
    label: 'Hello World',
    code: `# Python Playground\nname = "LOCODE"\nprint(f"Hello, {name}!")\n\nprofile = {"role": "Developer", "xp": 150}\nprint("Profile:", profile)`,
  },
  {
    label: 'List Comprehension',
    code: `# Filter and square even numbers\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8]\neven_squares = [n ** 2 for n in numbers if n % 2 == 0]\n\nprint("Even squares:", even_squares)`,
  },
  {
    label: 'Fibonacci',
    code: `def fibonacci(n):\n    seq = [0, 1]\n    for i in range(2, n):\n        seq.append(seq[i - 1] + seq[i - 2])\n    return seq\n\nprint("Fibonacci:", fibonacci(8))`,
  },
  {
    label: 'Blank Slate',
    code: `# Write your Python code here!\n`,
  },
];

export function SandboxScreen({ navigation }: SandboxScreenProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useUserStore((s) => s.theme);
  const selectedLanguage = useUserStore((s) => s.selectedLanguage);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const isDark = themeMode === 'dark';

  // Strictly locked to the active course language - no cross-course access
  const activeCourse = selectedLanguage === 'python' ? 'python' : 'javascript';
  const templates = activeCourse === 'python' ? PYTHON_TEMPLATES : JS_TEMPLATES;

  const [code, setCode] = useState<string>(templates[0].code);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const bottomInset = Math.max(insets.bottom, 12);
  const { isKeyboardVisible, keyboardHeight, animatedHeight, dismissKeyboard } = useKeyboardAnimation({
    initialBottom: bottomInset,
  });
  const [isAiInputFocused, setIsAiInputFocused] = useState<boolean>(false);

  // Console output state
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [returnValue, setReturnValue] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<{ message: string; line?: number } | null>(null);
  const [executionDuration, setExecutionDuration] = useState<number | null>(null);

  // Active drawer tab: 'console' | 'ai'
  const [activeBottomTab, setActiveBottomTab] = useState<'console' | 'ai'>('console');
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(true);

  // AI Tutor state
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const webViewRef = useRef<WebView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isKeyboardVisible) {
      setIsAiInputFocused(false);
    }
  }, [isKeyboardVisible]);

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 0,
    16
  );

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'set_language', language: activeCourse })
    );
  }, [activeCourse]);

  const handleRunCode = () => {
    Keyboard.dismiss();
    setIsRunning(true);
    setExecutionError(null);
    setReturnValue(null);
    setLogs([]);
    setIsDrawerExpanded(true);
    setActiveBottomTab('console');

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'run_sandbox',
        runId: `sandbox-${Date.now()}`,
        code,
        language: activeCourse,
      })
    );
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'runner_ready') {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'set_code', code, language: activeCourse })
        );
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'set_theme', isDark })
        );
      } else if (msg.type === 'code_change') {
        setCode(msg.code);
      } else if (msg.type === 'editor_focus') {
        setIsAiInputFocused(false);
      } else if (msg.type === 'sandbox_complete') {
        setIsRunning(false);
        setLogs(msg.logs || []);
        setExecutionDuration(msg.durationMs || 0);
        if (msg.status === 'error' && msg.error) {
          setExecutionError(msg.error);
        } else {
          setExecutionError(null);
          setReturnValue(msg.result);
        }
      } else if (msg.type === 'sandbox_timeout') {
        setIsRunning(false);
        setExecutionError(msg.error || { message: 'Code execution timed out' });
      }
    } catch (e) {
      setIsRunning(false);
    }
  };

  const handleInsertSymbol = (sym: string) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'insert_symbol', symbol: sym }));
  };

  const handleSelectTemplate = (templateCode: string) => {
    setCode(templateCode);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'set_code', code: templateCode }));
    setLogs([]);
    setExecutionError(null);
    setReturnValue(null);
  };

  const handleResetCode = () => {
    const defaultCode = templates[0].code;
    setCode(defaultCode);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'set_code', code: defaultCode }));
    setLogs([]);
    setExecutionError(null);
    setReturnValue(null);
  };

  const handleAskAI = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    setIsDrawerExpanded(true);
    setActiveBottomTab('ai');

    try {
      const res: SandboxTutorResponse = await askSandboxTutor({
        code,
        question: promptText,
        language: activeCourse,
      });
      setAiResponse(res.answer);
    } catch (err) {
      setAiResponse('Unable to connect to tutor service. Check your code syntax and try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Chat elevation flag: active whenever user is asking AI or has keyboard open specifically on AI tab
  const isChatElevated = activeBottomTab === 'ai' && isAiInputFocused;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.innerContainer}>

      {/* TOP NAVBAR (Course-Locked: No switching across languages) */}
      <View style={[styles.topBar, { paddingTop: topPadding + 4, borderBottomColor: colors.surface2 }]}>
        <View style={styles.topBarLeft}>
          <View style={styles.brandBadgeWrap}>
            {activeCourse === 'javascript' ? (
              <JavaScriptLogo size={22} />
            ) : (
              <PythonLogo size={22} />
            )}
            <View>
              <Text style={[styles.screenTitle, { color: colors.text }]}>
                {activeCourse === 'javascript' ? 'JavaScript Sandbox' : 'Python Sandbox'}
              </Text>
              <Text style={[styles.screenSub, { color: colors.textMuted }]}>
                {activeCourse === 'javascript' ? 'Web & Logic Playground' : 'Data & Scripting Playground'}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Actions: Reset & Active Path Indicator */}
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
            onPress={handleResetCode}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityLabel="Reset code to default snippet"
          >
            <RotateCcw color={colors.textMuted} size={15} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={[styles.activeTrackPill, { backgroundColor: activeCourse === 'javascript' ? '#F7DF1E22' : '#3776AB22' }]}>
            <Text style={[styles.activeTrackText, { color: activeCourse === 'javascript' ? '#D97706' : '#2563EB' }]}>
              {activeCourse.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

        {/* CODE CONTEXT COMPACT BAR (when chatting with AI and keyboard elevated) */}
        {isChatElevated && (
          <TouchableOpacity
            style={[styles.codeContextBar, { backgroundColor: colors.surface2, borderBottomColor: colors.surface }]}
            onPress={() => {
              Keyboard.dismiss();
              setIsAiInputFocused(false);
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Code2 size={14} color={colors.primary} />
              <Text style={[styles.codeContextText, { color: colors.text }]}>
                {activeCourse === 'javascript' ? 'JavaScript Sandbox' : 'Python Sandbox'} • AI has your code context
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.codeContextAction, { color: colors.primary }]}>View Code</Text>
              <ChevronDown size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* SNIPPETS / TEMPLATES STRIP (Only active course templates, hidden during AI chat) */}
        {!isChatElevated && (
          <View style={[styles.templateStrip, { backgroundColor: colors.surface, borderBottomColor: colors.surface2 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
              <Text style={[styles.templatesLabel, { color: colors.textMuted }]}>Snippets:</Text>
              {templates.map((t) => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.templateChip, { backgroundColor: colors.surface2 }]}
                  onPress={() => handleSelectTemplate(t.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.templateChipText, { color: colors.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* CODE EDITOR WEBVIEW */}
        <View style={isChatElevated ? styles.editorContainerHidden : styles.editorContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: SANDBOX_RUNNER_HTML }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
            style={styles.webView}
            scrollEnabled={false}
            keyboardDisplayRequiresUserAction={false}
            hideKeyboardAccessoryView={true}
          />

          {/* FLOATING RUN & AI BUTTONS (Over editor) */}
          {!isKeyboardVisible && !isChatElevated && (
            <View style={styles.floatingActionRow}>
              <TouchableOpacity
                style={[
                  styles.actionPillBtn,
                  styles.aiPillBtn,
                  { backgroundColor: colors.surface, borderColor: colors.primary },
                ]}
                onPress={() => {
                  setActiveBottomTab('ai');
                  setIsDrawerExpanded(true);
                }}
                activeOpacity={0.8}
              >
                <Sparkles color={colors.primary} size={16} strokeWidth={2.4} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>AI Tips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionPillBtn,
                  styles.runPillBtn,
                  { backgroundColor: isRunning ? colors.textMuted : colors.primary },
                ]}
                onPress={handleRunCode}
                disabled={isRunning}
                activeOpacity={0.85}
              >
                {isRunning ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Play color="#FFFFFF" size={16} strokeWidth={2.6} fill="#FFFFFF" />
                )}
                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
                  {isRunning ? 'Running...' : 'Run Code'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SYMBOL BAR (Only shown when not asking AI or when typing in editor) */}
        {!isChatElevated && (
          <SymbolBar
            onInsertSymbol={handleInsertSymbol}
            onRunTests={handleRunCode}
            isRunning={isRunning}
            isKeyboardVisible={isKeyboardVisible && !isAiInputFocused}
            language={activeCourse}
            onDismissKeyboard={dismissKeyboard}
          />
        )}

        {/* BOTTOM DRAWER / CONSOLE & AI COACH */}
        {/* When typing in editor with keyboard open, drawer is hidden so SymbolBar is docked directly on top of the keyboard */}
        {(!isKeyboardVisible || isChatElevated) && (
          <View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.surface2,
              },
              isChatElevated
                ? styles.drawerChatElevated
                : (isDrawerExpanded ? styles.drawerNormal : undefined),
            ]}
          >
        {/* Drawer Header Tabs */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerTabs}>
            <TouchableOpacity
              style={[
                styles.drawerTab,
                activeBottomTab === 'console' && [styles.drawerTabActive, { borderColor: colors.primary }],
              ]}
              onPress={() => {
                setActiveBottomTab('console');
                setIsDrawerExpanded(true);
                Keyboard.dismiss();
              }}
            >
              <Terminal
                size={15}
                color={activeBottomTab === 'console' ? colors.primary : colors.textMuted}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.drawerTabText,
                  { color: activeBottomTab === 'console' ? colors.primary : colors.textMuted },
                ]}
              >
                Console Logs
              </Text>
              {logs.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.countBadgeText}>{logs.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.drawerTab,
                activeBottomTab === 'ai' && [styles.drawerTabActive, { borderColor: colors.primary }],
              ]}
              onPress={() => {
                setActiveBottomTab('ai');
                setIsDrawerExpanded(true);
              }}
            >
              <Bot
                size={15}
                color={activeBottomTab === 'ai' ? colors.primary : colors.textMuted}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.drawerTabText,
                  { color: activeBottomTab === 'ai' ? colors.primary : colors.textMuted },
                ]}
              >
                AI Coach
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Expand/Collapse or Dismiss Keyboard */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isKeyboardVisible && (
              <TouchableOpacity
                style={styles.drawerToggleBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsAiInputFocused(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <KeyboardIcon size={16} color={colors.primary} strokeWidth={2.4} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.drawerToggleBtn}
              onPress={() => {
                if (isDrawerExpanded) {
                  Keyboard.dismiss();
                  setIsAiInputFocused(false);
                }
                setIsDrawerExpanded((prev) => !prev);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isDrawerExpanded ? (
                <ChevronDown size={18} color={colors.textMuted} strokeWidth={2.4} />
              ) : (
                <ChevronUp size={18} color={colors.textMuted} strokeWidth={2.4} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Drawer Body Content */}
        {isDrawerExpanded && (
          <View style={isChatElevated ? styles.drawerBodyChatElevated : styles.drawerBodyNormal}>
            {activeBottomTab === 'console' ? (
              /* ================= CONSOLE TAB ================= */
              <ScrollView style={styles.consoleScroll} contentContainerStyle={styles.consoleContent}>
                {executionError && (
                  <View style={styles.errorBox}>
                    <View style={styles.errorHeader}>
                      <AlertTriangle color="#EF4444" size={16} strokeWidth={2.4} />
                      <Text style={styles.errorTitle}>Runtime Error</Text>
                      {executionError.line && (
                        <Text style={styles.errorLinePill}>Line {executionError.line}</Text>
                      )}
                    </View>
                    <Text style={styles.errorMsg}>{executionError.message}</Text>
                    <TouchableOpacity
                      style={styles.debugWithAiBtn}
                      onPress={() => {
                        handleAskAI(`Debug this error on line ${executionError.line || '?'}: ${executionError.message}`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Sparkles color="#FFFFFF" size={12} strokeWidth={2.6} />
                      <Text style={styles.debugWithAiBtnText}>Ask AI to Debug</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {logs.length === 0 && !executionError && !returnValue ? (
                  <View style={styles.emptyConsoleWrap}>
                    <Terminal size={24} color={colors.textMuted} strokeWidth={1.8} />
                    <Text style={[styles.emptyConsoleText, { color: colors.textMuted }]}>
                      No output yet. Click "Run Code" above to execute!
                    </Text>
                  </View>
                ) : (
                  <>
                    {logs.map((l, idx) => (
                      <View key={idx} style={styles.logRow}>
                        <Text style={[styles.logPrefix, { color: colors.textMuted }]}>›</Text>
                        <Text
                          style={[
                            styles.logText,
                            {
                              color:
                                l.level === 'error'
                                  ? '#EF4444'
                                  : l.level === 'warn'
                                  ? '#F59E0B'
                                  : colors.text,
                            },
                          ]}
                        >
                          {l.text}
                        </Text>
                      </View>
                    ))}

                    {returnValue !== null && (
                      <View style={styles.returnRow}>
                        <Text style={styles.returnPrefix}>⇐ Result:</Text>
                        <Text style={[styles.returnValText, { color: colors.primary }]}>{returnValue}</Text>
                      </View>
                    )}

                    {executionDuration !== null && (
                      <Text style={[styles.durationMeta, { color: colors.textMuted }]}>
                        Executed in {executionDuration}ms
                      </Text>
                    )}
                  </>
                )}
              </ScrollView>
            ) : (
              /* ================= AI COACH TAB ================= */
              <View style={styles.aiContainer}>
                <ScrollView
                  style={styles.aiScroll}
                  contentContainerStyle={styles.aiContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Quick Action Chips */}
                  <View style={styles.aiChipsWrap}>
                    <TouchableOpacity
                      style={[styles.aiChip, { backgroundColor: colors.surface2 }]}
                      onPress={() => handleAskAI('Analyze this code for syntax errors, bugs, or common beginner mistakes.')}
                      disabled={isAiLoading}
                    >
                      <Lightbulb color={colors.primary} size={13} strokeWidth={2.4} />
                      <Text style={[styles.aiChipText, { color: colors.text }]}>Find Errors & Bugs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.aiChip, { backgroundColor: colors.surface2 }]}
                      onPress={() => handleAskAI('How can I optimize and improve this code for clarity and best practices?')}
                      disabled={isAiLoading}
                    >
                      <Sparkles color={colors.primary} size={13} strokeWidth={2.4} />
                      <Text style={[styles.aiChipText, { color: colors.text }]}>Improve & Optimize</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.aiChip, { backgroundColor: colors.surface2 }]}
                      onPress={() => handleAskAI('Explain step-by-step what this code does in plain English.')}
                      disabled={isAiLoading}
                    >
                      <HelpCircle color={colors.primary} size={13} strokeWidth={2.4} />
                      <Text style={[styles.aiChipText, { color: colors.text }]}>Explain Code</Text>
                    </TouchableOpacity>
                  </View>

                  {/* AI Response Display */}
                  {isAiLoading && (
                    <View style={[styles.aiCard, { backgroundColor: colors.surface2 }]}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={[styles.aiLoadingText, { color: colors.primary }]}>
                        Analyzing code with LOCODE AI...
                      </Text>
                    </View>
                  )}

                  {aiResponse && !isAiLoading && (
                    <View style={[styles.aiCard, { backgroundColor: colors.surface2, borderColor: colors.primary }]}>
                      <View style={styles.aiCardHeader}>
                        <View style={styles.aiCardBadge}>
                          <Bot size={13} color="#FFFFFF" strokeWidth={2.6} />
                          <Text style={styles.aiCardBadgeText}>AI TUTOR</Text>
                        </View>
                        <TouchableOpacity onPress={() => setAiResponse(null)}>
                          <X size={15} color={colors.textMuted} strokeWidth={2.4} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.aiAnswerText, { color: colors.text }]}>{aiResponse}</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Custom Question Input Row - ALWAYS lifted above keyboard */}
                <View
                  style={[
                    styles.askInputRow,
                    {
                      backgroundColor: colors.surface,
                      borderTopColor: colors.surface2,
                    },
                  ]}
                >
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.askInput,
                      {
                        backgroundColor: colors.surface2,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Ask about this code..."
                    placeholderTextColor={colors.textMuted}
                    value={customQuestion}
                    onChangeText={setCustomQuestion}
                    onFocus={() => {
                      setIsAiInputFocused(true);
                      setIsDrawerExpanded(true);
                      setActiveBottomTab('ai');
                    }}
                    onBlur={() => {
                      if (!isKeyboardVisible) {
                        setIsAiInputFocused(false);
                      }
                    }}
                    onSubmitEditing={() => {
                      if (customQuestion.trim()) {
                        handleAskAI(customQuestion);
                        setCustomQuestion('');
                      }
                      Keyboard.dismiss();
                      setIsAiInputFocused(false);
                    }}
                    returnKeyType="send"
                    editable={!isAiLoading}
                  />

                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      { backgroundColor: customQuestion.trim() ? colors.primary : colors.surface2 },
                    ]}
                    onPress={() => {
                      if (customQuestion.trim()) {
                        handleAskAI(customQuestion);
                        setCustomQuestion('');
                      }
                      Keyboard.dismiss();
                      setIsAiInputFocused(false);
                    }}
                    disabled={!customQuestion.trim() || isAiLoading}
                  >
                    <Send size={15} color="#FFFFFF" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        </View>
        )}

        {/* Dynamic Animated Keyboard Spacer: docks SymbolBar directly on top of the keyboard */}
        <Animated.View style={{ height: animatedHeight }} />
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
  codeContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  codeContextText: {
    fontSize: 12,
    fontWeight: '700',
  },
  codeContextAction: {
    fontSize: 12,
    fontWeight: '800',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  screenSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTrackPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTrackText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  templateStrip: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  templateScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  templatesLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  editorContainerHidden: {
    height: 0,
    flex: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingActionRow: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  aiPillBtn: {
    borderWidth: 1.5,
  },
  runPillBtn: {},
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  drawer: {
    borderTopWidth: 1,
  },
  drawerNormal: {
    maxHeight: 280,
    height: 240,
  },
  drawerChatElevated: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  drawerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  drawerTabActive: {
    borderBottomWidth: 2,
  },
  drawerTabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  drawerToggleBtn: {
    padding: 6,
  },
  drawerBodyNormal: {
    height: 190,
  },
  drawerBodyChatElevated: {
    flex: 1,
  },
  consoleScroll: {
    flex: 1,
  },
  consoleContent: {
    padding: 14,
    gap: 6,
  },
  emptyConsoleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyConsoleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  logPrefix: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 13,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    marginTop: 4,
  },
  returnPrefix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  returnValText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  durationMeta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 8,
    gap: 6,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  errorLinePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  errorMsg: {
    color: '#EF4444',
    fontSize: 12.5,
    lineHeight: 17,
    fontFamily: 'monospace',
  },
  debugWithAiBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    marginTop: 4,
  },
  debugWithAiBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  aiContainer: {
    flex: 1,
  },
  aiScroll: {
    flex: 1,
  },
  aiContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  aiChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  aiChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B4BDB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  aiCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  aiLoadingText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  aiAnswerText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
  },
  askInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  askInput: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
