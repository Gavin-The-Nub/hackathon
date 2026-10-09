import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Code2,
  Lightbulb,
  Bot,
  Package,
  GitFork,
  Repeat,
  Cpu,
  Layers,
} from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { ConceptId } from '../../core/types';
import { LESSONS, LessonData } from '../../content/lessons';
import { PROBLEMS } from '../../content/data';
import { askLessonTutor } from '../../services/lesson-tutor-service';

interface LessonScreenProps {
  route: any;
  navigation: any;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  source?: 'ai' | 'knowledge_base' | 'fallback';
}

export function LessonScreen({ route, navigation }: LessonScreenProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const conceptId: ConceptId = route.params?.conceptId || 'variables_types';
  const targetProblemId: string | undefined = route.params?.problemId;

  const lesson: LessonData = LESSONS[conceptId] || LESSONS.variables_types;

  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const safeTop = Math.max(insets.top, androidBarHeight, 44);

  // Quick check quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // AI Tutor Q&A state
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Hello! I am your offline AI tutor. Have any questions about ${lesson.title}? Tap a suggested topic below or type anything you want to ask!`,
      source: 'knowledge_base',
    },
  ]);

  const handleSendQuestion = async (textToSend?: string) => {
    const q = (textToSend || questionInput).trim();
    if (!q || isAsking) return;

    setQuestionInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const response = await askLessonTutor({
        conceptId,
        question: q,
        language: lesson.language,
      });

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response.answer,
        source: response.source,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: `In ${lesson.title}, keep practicing the core steps! Try the interactive coding problem below to see how the computer responds.`,
        source: 'fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleStartCoding = () => {
    // If a specific problem was passed from ProblemScreen, go back to it
    if (targetProblemId) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Problem', { problemId: targetProblemId });
      }
      return;
    }

    // Otherwise find the first problem for this concept
    const firstProb = PROBLEMS.find((p) => p.primaryConcept === conceptId) || PROBLEMS[0];
    navigation.navigate('Problem', { problemId: firstProb.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
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
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface2 }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
            {lesson.title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.unitPill, { backgroundColor: lesson.themeColor }]}>
              <Text style={styles.unitPillText}>{lesson.unitBadge}</Text>
            </View>
            <View style={[styles.offlineChip, { backgroundColor: colors.surface2 }]}>
              <Text style={[styles.offlineChipDot, { color: colors.success }]}>●</Text>
              <Text style={[styles.offlineChipText, { color: colors.primary }]}>OFFLINE</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Big Picture Analogy Card */}
          <View
            style={[
              styles.analogyCard,
              {
                backgroundColor: colors.surface,
                borderColor: lesson.themeColor,
                borderBottomColor: lesson.lipColor,
              },
            ]}
          >
            <View style={styles.analogyHeader}>
              <View style={[styles.analogyIconBox, { backgroundColor: lesson.themeColor + '18' }]}>
                {lesson.conceptId === 'variables_types' && <Package size={26} color={lesson.themeColor} strokeWidth={2.4} />}
                {lesson.conceptId === 'conditionals' && <GitFork size={26} color={lesson.themeColor} strokeWidth={2.4} />}
                {lesson.conceptId === 'loops' && <Repeat size={26} color={lesson.themeColor} strokeWidth={2.4} />}
                {lesson.conceptId === 'functions' && <Cpu size={26} color={lesson.themeColor} strokeWidth={2.4} />}
                {lesson.conceptId === 'arrays_lists' && <Layers size={26} color={lesson.themeColor} strokeWidth={2.4} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.analogySub, { color: lesson.themeColor }]}>
                  THE BIG PICTURE ANALOGY
                </Text>
                <Text style={[styles.analogyTitle, { color: colors.text }]}>
                  {lesson.analogy.title}
                </Text>
              </View>
            </View>
            <Text style={[styles.analogyDesc, { color: colors.text }]}>
              {lesson.analogy.description}
            </Text>
          </View>

          {/* Section: Core Concepts Breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Code2 size={20} color={lesson.themeColor} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Core Building Blocks
              </Text>
            </View>

            {lesson.conceptsExplained.map((c, idx) => (
              <View
                key={idx}
                style={[
                  styles.conceptCard,
                  { backgroundColor: colors.surface, borderColor: colors.surface2 },
                ]}
              >
                <Text style={[styles.conceptTerm, { color: colors.text }]}>
                  {idx + 1}. {c.term}
                </Text>
                <Text style={[styles.conceptDef, { color: colors.textMuted }]}>
                  {c.definition}
                </Text>
                <View style={[styles.syntaxBox, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.syntaxText, { color: lesson.themeColor }]}>
                    {c.syntaxTip}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Section: Code Examples */}
          {lesson.codeExamples.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Sparkles size={20} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Real Code Breakdown
                </Text>
              </View>

              {lesson.codeExamples.map((ex, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.exampleCard,
                    { backgroundColor: colors.surface, borderColor: colors.surface2 },
                  ]}
                >
                  <Text style={[styles.exampleTitle, { color: colors.text }]}>
                    {ex.title}
                  </Text>
                  <View style={[styles.codeContainer, { backgroundColor: '#0D1117' }]}>
                    <Text style={styles.codeText}>{ex.code}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                    <Lightbulb size={15} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.exampleExplanation, { color: colors.textMuted, flex: 1 }]}>
                      {ex.explanation}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Section: Common Pitfalls */}
          {lesson.commonPitfalls.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Common Beginner Traps
                </Text>
              </View>

              {lesson.commonPitfalls.map((pit, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.pitfallCard,
                    { backgroundColor: colors.surface, borderColor: 'rgba(239, 68, 68, 0.3)' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={15} color="#EF4444" />
                    <Text style={styles.pitfallMistake}>{pit.mistake}</Text>
                  </View>
                  <Text style={[styles.pitfallWhy, { color: colors.textMuted }]}>
                    <Text style={{ fontWeight: '700' }}>Why it happens: </Text>
                    {pit.whyItHappens}
                  </Text>
                  <Text style={[styles.pitfallFix, { color: colors.success }]}>
                    <Text style={{ fontWeight: '700' }}>Fix: </Text>
                    {pit.howToFix}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Section: Quick Check Quiz */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <CheckCircle size={20} color={lesson.themeColor} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Mental Check
              </Text>
            </View>

            <View
              style={[
                styles.quizCard,
                { backgroundColor: colors.surface, borderColor: colors.surface2 },
              ]}
            >
              <Text style={[styles.quizQuestion, { color: colors.text }]}>
                {lesson.quickCheck.question}
              </Text>

              {lesson.quickCheck.codeSnippet && (
                <View style={[styles.codeContainer, { backgroundColor: '#0D1117', marginVertical: 10 }]}>
                  <Text style={styles.codeText}>{lesson.quickCheck.codeSnippet}</Text>
                </View>
              )}

              <View style={styles.optionsWrap}>
                {lesson.quickCheck.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === lesson.quickCheck.correctIndex;
                  let optBorder = colors.surface2;
                  let optBg = colors.bg;

                  if (hasAnswered && isSelected) {
                    optBorder = isCorrect ? colors.success : '#EF4444';
                    optBg = isCorrect ? 'rgba(45, 184, 76, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                  }

                  return (
                    <TouchableOpacity
                      key={optIdx}
                      style={[
                        styles.optionBtn,
                        { backgroundColor: optBg, borderColor: optBorder },
                      ]}
                      onPress={() => {
                        setSelectedOption(optIdx);
                        setHasAnswered(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionIndex, { color: colors.textMuted }]}>
                        {['A', 'B', 'C', 'D'][optIdx]}
                      </Text>
                      <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {hasAnswered && (
                <View
                  style={[
                    styles.quizFeedback,
                    {
                      backgroundColor:
                        selectedOption === lesson.quickCheck.correctIndex
                          ? 'rgba(45, 184, 76, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackText,
                      {
                        color:
                          selectedOption === lesson.quickCheck.correctIndex
                            ? colors.success
                            : '#EF4444',
                      },
                    ]}
                  >
                    {selectedOption === lesson.quickCheck.correctIndex
                      ? lesson.quickCheck.explanation
                      : `Not quite! ${lesson.quickCheck.explanation}`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Section: Ask the AI Tutor */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <HelpCircle size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Ask the AI Tutor
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Ask anything about this lesson. Works 100% offline on your device!
                </Text>
              </View>
            </View>

            {/* Suggested Question Chips */}
            <View style={styles.suggestedWrap}>
              <Text style={[styles.suggestedLabel, { color: colors.textMuted }]}>
                SUGGESTED QUESTIONS:
              </Text>
              <View style={styles.pillsContainer}>
                {lesson.suggestedQuestions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.pillBtn,
                      { backgroundColor: colors.surface, borderColor: colors.surface2 },
                    ]}
                    onPress={() => handleSendQuestion(q)}
                    disabled={isAsking}
                    activeOpacity={0.7}
                  >
                    <Lightbulb size={14} color={colors.primary} />
                    <Text style={[styles.pillText, { color: colors.text }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Q&A Chat Thread */}
            <View
              style={[
                styles.chatContainer,
                { backgroundColor: colors.surface, borderColor: colors.surface2 },
              ]}
            >
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.chatBubble,
                    m.sender === 'user' ? styles.userBubble : styles.tutorBubble,
                    m.sender === 'user'
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.surface2 },
                  ]}
                >
                  {m.sender === 'tutor' && (
                    <View style={styles.tutorHeaderRow}>
                      <Bot size={18} color={colors.primary} />
                      <Text style={[styles.tutorName, { color: colors.text }]}>AI Tutor</Text>
                      <View style={styles.offlinePill}>
                        <Text style={styles.offlinePillText}>OFFLINE</Text>
                      </View>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: m.sender === 'user' ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}

              {isAsking && (
                <View style={[styles.loadingRow, { backgroundColor: colors.surface2 }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                    AI Tutor is thinking on your phone...
                  </Text>
                </View>
              )}

              {/* Input Box */}
              <View style={[styles.inputRow, { borderTopColor: colors.surface2 }]}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.surface2,
                    },
                  ]}
                  placeholder="Ask any question about this lesson..."
                  placeholderTextColor={colors.textMuted}
                  value={questionInput}
                  onChangeText={setQuestionInput}
                  onSubmitEditing={() => handleSendQuestion()}
                  returnKeyType="send"
                  editable={!isAsking}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    { backgroundColor: questionInput.trim() ? colors.primary : colors.surface2 },
                  ]}
                  onPress={() => handleSendQuestion()}
                  disabled={!questionInput.trim() || isAsking}
                  activeOpacity={0.8}
                >
                  <Send size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom CTA to start coding */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              {
                backgroundColor: lesson.themeColor,
                borderBottomColor: lesson.lipColor,
              },
            ]}
            onPress={handleStartCoding}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>READY TO PRACTICE →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unitPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  offlineChipDot: {
    fontSize: 9,
  },
  offlineChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 22,
  },

  /* Analogy Card */
  analogyCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    gap: 12,
  },
  analogyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analogyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analogyIcon: {
    fontSize: 36,
  },
  analogySub: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  analogyTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  analogyDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },

  /* Section */
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },

  /* Concept Cards */
  conceptCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  conceptTerm: {
    fontSize: 15,
    fontWeight: '800',
  },
  conceptDef: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  syntaxBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 2,
  },
  syntaxText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Code Examples */
  exampleCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  codeContainer: {
    padding: 14,
    borderRadius: 12,
  },
  codeText: {
    color: '#E6EDF3',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  exampleExplanation: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Pitfalls */
  pitfallCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  pitfallMistake: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  pitfallWhy: {
    fontSize: 13,
    lineHeight: 18,
  },
  pitfallFix: {
    fontSize: 13,
    lineHeight: 18,
  },

  /* Quiz */
  quizCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  quizQuestion: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  optionsWrap: {
    gap: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  optionIndex: {
    fontSize: 13,
    fontWeight: '800',
    width: 18,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  quizFeedback: {
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  /* AI Tutor Q&A */
  suggestedWrap: {
    gap: 8,
  },
  suggestedLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chatContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: 4,
  },
  chatBubble: {
    padding: 12,
    margin: 10,
    borderRadius: 14,
    maxWidth: '88%',
    gap: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  tutorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tutorAvatar: {
    fontSize: 14,
  },
  tutorName: {
    fontSize: 12,
    fontWeight: '800',
  },
  offlinePill: {
    backgroundColor: 'rgba(45, 184, 76, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offlinePillText: {
    color: '#2DB84C',
    fontSize: 9,
    fontWeight: '800',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    margin: 10,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  inputField: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Bottom CTA */
  ctaBtn: {
    height: 56,
    borderRadius: 18,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
