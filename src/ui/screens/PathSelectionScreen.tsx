import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Check,
  Sparkles,
  Terminal,
  Code2,
  Globe,
  Smartphone,
  Server,
  Gamepad2,
  Bot,
  ChartBar,
  Cloud,
  X,
} from 'lucide-react-native';

import { useUserStore } from '../../state/userStore';
import {
  JavaScriptLogo,
  PythonLogo,
  JavaScriptHeroLogo,
  PythonHeroLogo,
} from '../components/LanguageLogos';

interface PathSelectionScreenProps {
  navigation: any;
  route?: any;
}

export function PathSelectionScreen({ navigation }: PathSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const selectedLanguage = useUserStore((s) => s.selectedLanguage);
  const hasSelectedLanguage = useUserStore((s) => s.hasSelectedLanguage);
  const setSelectedLanguage = useUserStore((s) => s.setSelectedLanguage);

  // Active carousel page (0 = JavaScript, 1 = Python)
  const [activeIndex, setActiveIndex] = useState<number>(
    selectedLanguage === 'python' && hasSelectedLanguage ? 1 : 0
  );

  const scrollRef = useRef<ScrollView>(null);

  const isSmallScreen = screenHeight < 720;
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 0, 16);
  const bottomPadding = Math.max(insets.bottom, 16);

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / screenWidth);
    if (page !== activeIndex && (page === 0 || page === 1)) {
      setActiveIndex(page);
    }
  };

  const handleChooseJavaScript = () => {
    setSelectedLanguage('javascript');
    if (navigation.canGoBack() && hasSelectedLanguage) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleChoosePython = () => {
    setSelectedLanguage('python');
    if (navigation.canGoBack() && hasSelectedLanguage) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const isJsActive = selectedLanguage === 'javascript' && hasSelectedLanguage;
  const isPyActive = selectedLanguage === 'python' && hasSelectedLanguage;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* FULL-SCREEN HORIZONTAL CAROUSEL - Top section is included inside each page */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.carousel}
      >
        {/* ================= PAGE 1: JAVASCRIPT (PASTEL YELLOW) ================= */}
        <View style={[styles.page, { width: screenWidth, backgroundColor: '#FEE75C' }]}>
          <ScrollView
            contentContainerStyle={[
              styles.pageScrollContent,
              {
                paddingTop: topPadding + 6,
                paddingBottom: bottomPadding + 16,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row */}
            <View style={styles.topRow}>
              <View style={styles.brandBadge}>
                <Terminal color="#18181B" size={16} strokeWidth={2.6} />
                <Text style={styles.brandText}>CODECHAMP</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>OFFLINE</Text>
                </View>
              </View>

              {hasSelectedLanguage && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Close path picker"
                >
                  <X color="#18181B" size={18} strokeWidth={2.8} />
                </TouchableOpacity>
              )}
            </View>

            {/* Segmented Tabs inside Page 1 */}
            <View style={styles.segmentedTabsContainer}>
              <TouchableOpacity
                style={[styles.tabPill, styles.tabPillActive]}
                activeOpacity={0.9}
              >
                <Code2 color="#FFFFFF" size={15} strokeWidth={2.6} />
                <Text style={[styles.tabText, styles.tabTextActive]}>JavaScript</Text>
                {isJsActive && (
                  <View style={styles.activeDot}>
                    <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabPill}
                onPress={() => handleTabPress(1)}
                activeOpacity={0.7}
              >
                <Terminal color="#3F3F46" size={15} strokeWidth={2.6} />
                <Text style={styles.tabText}>Python</Text>
                {isPyActive && (
                  <View style={styles.activeDot}>
                    <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Title Section (Matching screenshot's Speak With Confidence layout) */}
            <View style={styles.heroTextSection}>
              <Text style={styles.bigHeroTitle}>Code</Text>
              <View style={styles.titleRow}>
                <Text style={styles.bigHeroTitle}>With</Text>
                {/* Waveform / Badge Pill from screenshot */}
                <View style={styles.waveformPill}>
                  <View style={styles.waveBar} />
                  <View style={[styles.waveBar, { height: 18 }]} />
                  <View style={[styles.waveBar, { height: 14 }]} />
                  <View style={[styles.waveBar, { height: 20 }]} />
                  <View style={[styles.waveBar, { height: 12 }]} />
                  <View style={styles.micCircle}>
                    <Sparkles color="#FFFFFF" size={12} strokeWidth={2.8} />
                  </View>
                </View>
              </View>
              <Text style={styles.bigHeroTitle}>Confidence</Text>

              <Text style={styles.heroSubtitle}>
                Master variables, functions, and algorithms with hands-on exercises and instant on-device AI coaching.
              </Text>
            </View>

            {/* Prominent JavaScript Logo in the center */}
            <JavaScriptHeroLogo size={isSmallScreen ? 100 : 124} />

            {/* Language Identity Meta Card */}
            <View style={styles.infoGlassCard}>
              <View style={styles.infoLeft}>
                <JavaScriptLogo size={42} />
                <View style={styles.infoMeta}>
                  <View style={styles.langTitleRow}>
                    <Text style={styles.cardLangName}>JavaScript</Text>
                    {isJsActive && (
                      <View style={styles.activePillBadge}>
                        <Text style={styles.activePillText}>CURRENT PATH</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardLangSubtitle}>5 Units · 25 Interactive Lessons</Text>
                </View>
              </View>
            </View>

            {/* Real-World Outcomes Pills with Actual Vector Icons */}
            <View style={styles.tagChipsWrap}>
              <View style={styles.tagChip}>
                <Globe color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Web & Frontend</Text>
              </View>
              <View style={styles.tagChip}>
                <Smartphone color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Mobile (React Native)</Text>
              </View>
              <View style={styles.tagChip}>
                <Server color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Full-Stack Node</Text>
              </View>
              <View style={styles.tagChip}>
                <Gamepad2 color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Game Dev</Text>
              </View>
            </View>

            {/* Pagination Dots (• • from screenshot) */}
            <View style={styles.paginationDotsContainer}>
              <View style={[styles.dotPill, styles.dotPillActive]} />
              <View style={styles.dotCircle} />
            </View>

            {/* Bottom Rounded Black Button */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              onPress={handleChooseJavaScript}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryButtonText}>
                {isJsActive ? 'Continue JavaScript' : 'Start JavaScript Path'}
              </Text>
              <View style={styles.buttonArrowPill}>
                <ArrowRight color="#FFFFFF" size={18} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ================= PAGE 2: PYTHON (PASTEL LILAC) ================= */}
        <View style={[styles.page, { width: screenWidth, backgroundColor: '#DDD6FE' }]}>
          <ScrollView
            contentContainerStyle={[
              styles.pageScrollContent,
              {
                paddingTop: topPadding + 6,
                paddingBottom: bottomPadding + 16,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row */}
            <View style={styles.topRow}>
              <View style={styles.brandBadge}>
                <Terminal color="#18181B" size={16} strokeWidth={2.6} />
                <Text style={styles.brandText}>CODECHAMP</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>OFFLINE</Text>
                </View>
              </View>

              {hasSelectedLanguage && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Close path picker"
                >
                  <X color="#18181B" size={18} strokeWidth={2.8} />
                </TouchableOpacity>
              )}
            </View>

            {/* Segmented Tabs inside Page 2 */}
            <View style={styles.segmentedTabsContainer}>
              <TouchableOpacity
                style={styles.tabPill}
                onPress={() => handleTabPress(0)}
                activeOpacity={0.7}
              >
                <Code2 color="#3F3F46" size={15} strokeWidth={2.6} />
                <Text style={styles.tabText}>JavaScript</Text>
                {isJsActive && (
                  <View style={styles.activeDot}>
                    <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabPill, styles.tabPillActive]}
                activeOpacity={0.9}
              >
                <Terminal color="#FFFFFF" size={15} strokeWidth={2.6} />
                <Text style={[styles.tabText, styles.tabTextActive]}>Python</Text>
                {isPyActive && (
                  <View style={styles.activeDot}>
                    <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Title Section (Matching screenshot's Learn Anytime Easily Anywhere layout) */}
            <View style={styles.heroTextSection}>
              <View style={styles.titleRow}>
                <Text style={styles.bigHeroTitle}>Learn</Text>
                {/* Languages Pill with Arrow from screenshot */}
                <View style={styles.langPillBadge}>
                  <Text style={styles.langPillBadgeText}>Python</Text>
                  <View style={styles.langPillArrowCircle}>
                    <ArrowRight color="#FFFFFF" size={12} strokeWidth={3} />
                  </View>
                </View>
              </View>
              <Text style={styles.bigHeroTitle}>Anytime, Easily</Text>
              <Text style={styles.bigHeroTitle}>Anywhere</Text>

              <Text style={styles.heroSubtitle}>
                Build a daily coding habit with clean, human-readable syntax. Loved by beginner programmers and AI researchers alike.
              </Text>
            </View>

            {/* Prominent Python Logo in the center */}
            <PythonHeroLogo size={isSmallScreen ? 100 : 124} />

            {/* Language Identity Meta Card */}
            <View style={styles.infoGlassCard}>
              <View style={styles.infoLeft}>
                <PythonLogo size={42} />
                <View style={styles.infoMeta}>
                  <View style={styles.langTitleRow}>
                    <Text style={styles.cardLangName}>Python</Text>
                    {isPyActive ? (
                      <View style={styles.activePillBadge}>
                        <Text style={styles.activePillText}>CURRENT PATH</Text>
                      </View>
                    ) : (
                      <View style={[styles.activePillBadge, { backgroundColor: '#8B5CF6' }]}>
                        <Text style={styles.activePillText}>AI READY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardLangSubtitle}>Data Science · AI & Automation</Text>
                </View>
              </View>
            </View>

            {/* Real-World Outcomes Pills with Actual Vector Icons */}
            <View style={styles.tagChipsWrap}>
              <View style={styles.tagChip}>
                <Bot color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>AI & Machine Learning</Text>
              </View>
              <View style={styles.tagChip}>
                <ChartBar color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Data Science & Math</Text>
              </View>
              <View style={styles.tagChip}>
                <Terminal color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Scripting & DevOps</Text>
              </View>
              <View style={styles.tagChip}>
                <Cloud color="#18181B" size={13} strokeWidth={2.5} />
                <Text style={styles.tagChipText}>Backend APIs</Text>
              </View>
            </View>

            {/* Pagination Dots (• • from screenshot) */}
            <View style={styles.paginationDotsContainer}>
              <View style={styles.dotCircle} />
              <View style={[styles.dotPill, styles.dotPillActive]} />
            </View>

            {/* Bottom Rounded Black Button */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              onPress={handleChoosePython}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryButtonText}>
                {isPyActive ? 'Continue Python' : 'Choose Python Path'}
              </Text>
              <View style={styles.buttonArrowPill}>
                <ArrowRight color="#FFFFFF" size={18} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEE75C',
  },
  carousel: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageScrollContent: {
    paddingHorizontal: 22,
    alignItems: 'stretch',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#18181B',
  },
  badgePill: {
    backgroundColor: 'rgba(24, 24, 27, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#18181B',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(24, 24, 27, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 24, 27, 0.07)',
    borderRadius: 24,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#18181B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F3F46',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  heroTextSection: {
    marginBottom: 6,
  },
  bigHeroTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#18181B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 3.5,
  },
  waveBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#71717A',
  },
  micCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5733',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  langPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
    gap: 6,
  },
  langPillBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  langPillArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF5733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSubtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '600',
    color: '#27272A',
    marginTop: 8,
    opacity: 0.9,
  },
  infoGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(24, 24, 27, 0.08)',
    marginBottom: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoMeta: {
    flex: 1,
  },
  langTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLangName: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: '#18181B',
  },
  activePillBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cardLangSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#52525B',
    marginTop: 2,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 24, 27, 0.06)',
    gap: 6,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#18181B',
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dotCircle: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(24, 24, 27, 0.25)',
  },
  dotPill: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(24, 24, 27, 0.25)',
  },
  dotPillActive: {
    width: 22,
    backgroundColor: '#18181B',
  },
  primaryPillButton: {
    backgroundColor: '#18181B',
    borderRadius: 32,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  buttonArrowPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
