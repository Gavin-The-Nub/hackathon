import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Geologica_900Black } from '@expo-google-fonts/geologica';
import {
  ArrowRight,
  Check,
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
  BookOpen,
  Layers,
} from 'lucide-react-native';

import { useUserStore } from '../../state/userStore';
import {
  JavaScriptHeroLogo,
  PythonHeroLogo,
} from '../components/LanguageLogos';

interface PathSelectionScreenProps {
  navigation: any;
  route?: any;
}

export function PathSelectionScreen({ navigation }: PathSelectionScreenProps) {
  const [fontsLoaded] = useFonts({
    Geologica_900Black,
  });

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

  const titleFontStyle = fontsLoaded
    ? { fontFamily: 'Geologica_900Black' }
    : { fontWeight: '900' as const };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* FULL-SCREEN HORIZONTAL CAROUSEL */}
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
                paddingBottom: 12,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row - Offline tag removed */}
            <View style={styles.topRow}>
              <View style={styles.brandBadge}>
                <Terminal color="#18181B" size={16} strokeWidth={2.6} />
                <Text style={styles.brandText}>CODECHAMP</Text>
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

            {/* Title Section: Bigger & Geologica font */}
            <View style={styles.heroTextSection}>
              <Text style={[styles.bigHeroTitle, titleFontStyle]}>
                Code with{'\n'}Confidence
              </Text>
            </View>

            {/* Hero Row: 3D Logo on Left + Message Bubbles on Right side pointing at logo */}
            <View style={styles.heroRow}>
              <JavaScriptHeroLogo size={isSmallScreen ? 108 : 124} />

              <View style={styles.speechBubblesCol}>
                {/* Bubble 1: 5 Units */}
                <View style={styles.speechBubble}>
                  <View style={styles.bubblePointerLeft} />
                  <Layers color="#18181B" size={15} strokeWidth={2.6} />
                  <Text style={styles.speechBubbleText}>5 Units</Text>
                </View>

                {/* Bubble 2: 25 Interactive Lessons */}
                <View style={styles.speechBubble}>
                  <View style={styles.bubblePointerLeft} />
                  <BookOpen color="#18181B" size={15} strokeWidth={2.6} />
                  <Text style={styles.speechBubbleText}>25 Interactive Lessons</Text>
                </View>
              </View>
            </View>

            {/* Centered Real-World Outcomes Pills */}
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

            {/* Pagination Dots */}
            <View style={styles.paginationDotsContainer}>
              <View style={[styles.dotPill, styles.dotPillActive]} />
              <View style={styles.dotCircle} />
            </View>
          </ScrollView>

          {/* Bottom Dock: Tab Identifiers directly on top of Select Path Button */}
          <View style={[styles.bottomDock, { paddingBottom: bottomPadding }]}>
            {/* Tab Identifiers at top of button */}
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

            {/* Select Path Button */}
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
          </View>
        </View>

        {/* ================= PAGE 2: PYTHON (PASTEL LILAC) ================= */}
        <View style={[styles.page, { width: screenWidth, backgroundColor: '#DDD6FE' }]}>
          <ScrollView
            contentContainerStyle={[
              styles.pageScrollContent,
              {
                paddingTop: topPadding + 6,
                paddingBottom: 12,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row - Offline tag removed */}
            <View style={styles.topRow}>
              <View style={styles.brandBadge}>
                <Terminal color="#18181B" size={16} strokeWidth={2.6} />
                <Text style={styles.brandText}>CODECHAMP</Text>
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

            {/* Title Section: Bigger & Geologica font */}
            <View style={styles.heroTextSection}>
              <Text style={[styles.bigHeroTitle, titleFontStyle]}>
                Learn, anytime,{'\n'}anywhere
              </Text>
            </View>

            {/* Hero Row: 3D Logo on Left + Message Bubbles on Right side pointing at logo */}
            <View style={styles.heroRow}>
              <PythonHeroLogo size={isSmallScreen ? 108 : 124} />

              <View style={styles.speechBubblesCol}>
                {/* Bubble 1: 5 Units */}
                <View style={styles.speechBubble}>
                  <View style={styles.bubblePointerLeft} />
                  <Layers color="#18181B" size={15} strokeWidth={2.6} />
                  <Text style={styles.speechBubbleText}>5 Units</Text>
                </View>

                {/* Bubble 2: 25 Interactive Lessons */}
                <View style={styles.speechBubble}>
                  <View style={styles.bubblePointerLeft} />
                  <BookOpen color="#18181B" size={15} strokeWidth={2.6} />
                  <Text style={styles.speechBubbleText}>25 Interactive Lessons</Text>
                </View>
              </View>
            </View>

            {/* Centered Real-World Outcomes Pills */}
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

            {/* Pagination Dots */}
            <View style={styles.paginationDotsContainer}>
              <View style={styles.dotCircle} />
              <View style={[styles.dotPill, styles.dotPillActive]} />
            </View>
          </ScrollView>

          {/* Bottom Dock: Tab Identifiers directly on top of Select Path Button */}
          <View style={[styles.bottomDock, { paddingBottom: bottomPadding }]}>
            {/* Tab Identifiers at top of button */}
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

            {/* Select Path Button */}
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
          </View>
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
    justifyContent: 'space-between',
  },
  pageScrollContent: {
    paddingHorizontal: 22,
    alignItems: 'stretch',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(24, 24, 27, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextSection: {
    marginBottom: 14,
    marginTop: 2,
  },
  bigHeroTitle: {
    fontSize: 50,
    lineHeight: 52,
    letterSpacing: -1.6,
    color: '#18181B',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
  },
  speechBubblesCol: {
    gap: 10,
    justifyContent: 'center',
    flexShrink: 1,
  },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },
  bubblePointerLeft: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  speechBubbleText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#18181B',
    letterSpacing: 0.1,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 24, 27, 0.07)',
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
    marginVertical: 6,
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
  bottomDock: {
    paddingHorizontal: 22,
    paddingTop: 8,
    gap: 10,
    backgroundColor: 'transparent',
  },
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 24, 27, 0.08)',
    borderRadius: 24,
    padding: 4,
    gap: 4,
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

