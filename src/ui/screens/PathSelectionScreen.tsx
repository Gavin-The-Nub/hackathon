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
  Animated,
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
  const initialIndex = selectedLanguage === 'python' && hasSelectedLanguage ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

  const scrollX = useRef(new Animated.Value(initialIndex * screenWidth)).current;
  const scrollRef = useRef<any>(null);

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

  // Smooth background color interpolation between JS (pastel yellow) and Python (pastel lilac)
  const backgroundColor = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: ['#FEE75C', '#DDD6FE'],
    extrapolate: 'clamp',
  });

  // Smooth sliding pill indicator width & offset
  const containerPadding = 22;
  const innerTabsPadding = 4;
  const tabsGap = 4;
  const tabsAvailableWidth = screenWidth - (containerPadding * 2);
  const singleTabWidth = (tabsAvailableWidth - (innerTabsPadding * 2) - tabsGap) / 2;

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, singleTabWidth + tabsGap],
    extrapolate: 'clamp',
  });

  // Animated text color for tabs
  const jsTextColor = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: ['#FFFFFF', '#3F3F46'],
    extrapolate: 'clamp',
  });

  const pyTextColor = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: ['#3F3F46', '#FFFFFF'],
    extrapolate: 'clamp',
  });

  // Pagination dots interpolation
  const dot0Width = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [22, 7],
    extrapolate: 'clamp',
  });
  const dot0Opacity = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [1, 0.28],
    extrapolate: 'clamp',
  });

  const dot1Width = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [7, 22],
    extrapolate: 'clamp',
  });
  const dot1Opacity = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0.28, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar style="dark" />

      {/* ================= TOP PINNED HEADER ================= */}
      <View style={[styles.headerSection, { paddingTop: topPadding + 6 }]}>
        {/* Brand & Close Row */}
        <View style={styles.topRow}>
          <View style={styles.brandBadge}>
            <Terminal color="#18181B" size={16} strokeWidth={2.6} />
            <Text style={styles.brandText}>LOCODE</Text>
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

        {/* Top Segmented Navigation Tabs with Smooth Sliding Indicator */}
        <View style={styles.segmentedTabsContainer}>
          {/* Animated active sliding background pill */}
          <Animated.View
            style={[
              styles.slidingIndicator,
              {
                width: singleTabWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />

          {/* JavaScript Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress(0)}
            activeOpacity={0.8}
          >
            <Code2
              color={activeIndex === 0 ? '#FFFFFF' : '#3F3F46'}
              size={15}
              strokeWidth={2.6}
            />
            <Animated.Text style={[styles.tabText, { color: jsTextColor }]}>
              JavaScript
            </Animated.Text>
            {isJsActive && (
              <View style={styles.activeDot}>
                <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
              </View>
            )}
          </TouchableOpacity>

          {/* Python Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress(1)}
            activeOpacity={0.8}
          >
            <Terminal
              color={activeIndex === 1 ? '#FFFFFF' : '#3F3F46'}
              size={15}
              strokeWidth={2.6}
            />
            <Animated.Text style={[styles.tabText, { color: pyTextColor }]}>
              Python
            </Animated.Text>
            {isPyActive && (
              <View style={styles.activeDot}>
                <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= FULL-SCREEN HORIZONTAL CAROUSEL ================= */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const page = Math.round(offsetX / screenWidth);
              if (page !== activeIndex && (page === 0 || page === 1)) {
                setActiveIndex(page);
              }
            },
          }
        )}
        style={styles.carousel}
      >
        {/* ================= PAGE 1: JAVASCRIPT ================= */}
        <View style={[styles.page, { width: screenWidth }]}>
          <ScrollView
            contentContainerStyle={styles.pageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Section */}
            <View style={styles.heroTextSection}>
              <Text style={[styles.bigHeroTitle, titleFontStyle]}>
                Code with{'\n'}Confidence
              </Text>
            </View>

            {/* Centered 3D Logo (Message Bubbles Removed) */}
            <View style={styles.heroLogoCenter}>
              <JavaScriptHeroLogo size={isSmallScreen ? 116 : 134} />
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

            {/* Smooth Pagination Dots */}
            <View style={styles.paginationDotsContainer}>
              <Animated.View
                style={[
                  styles.animatedDot,
                  { width: dot0Width, opacity: dot0Opacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.animatedDot,
                  { width: dot1Width, opacity: dot1Opacity },
                ]}
              />
            </View>
          </ScrollView>
        </View>

        {/* ================= PAGE 2: PYTHON ================= */}
        <View style={[styles.page, { width: screenWidth }]}>
          <ScrollView
            contentContainerStyle={styles.pageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Section */}
            <View style={styles.heroTextSection}>
              <Text style={[styles.bigHeroTitle, titleFontStyle]}>
                Learn, anytime,{'\n'}anywhere
              </Text>
            </View>

            {/* Centered 3D Logo (Message Bubbles Removed) */}
            <View style={styles.heroLogoCenter}>
              <PythonHeroLogo size={isSmallScreen ? 116 : 134} />
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

            {/* Smooth Pagination Dots */}
            <View style={styles.paginationDotsContainer}>
              <Animated.View
                style={[
                  styles.animatedDot,
                  { width: dot0Width, opacity: dot0Opacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.animatedDot,
                  { width: dot1Width, opacity: dot1Opacity },
                ]}
              />
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* ================= BOTTOM PINNED ACTION BUTTON ================= */}
      <View style={[styles.bottomDock, { paddingBottom: bottomPadding }]}>
        <TouchableOpacity
          style={styles.primaryPillButton}
          onPress={activeIndex === 0 ? handleChooseJavaScript : handleChoosePython}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>
            {activeIndex === 0
              ? isJsActive
                ? 'Continue JavaScript'
                : 'Start JavaScript Path'
              : isPyActive
              ? 'Continue Python'
              : 'Choose Python Path'}
          </Text>
          <View style={styles.buttonArrowPill}>
            <ArrowRight color="#FFFFFF" size={18} strokeWidth={3} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 22,
    backgroundColor: 'transparent',
    zIndex: 10,
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
    backgroundColor: 'rgba(24, 24, 27, 0.08)',
    borderRadius: 24,
    padding: 4,
    gap: 4,
    position: 'relative',
    marginBottom: 8,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: '#18181B',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    zIndex: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
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
  carousel: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pageScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'stretch',
  },
  heroTextSection: {
    marginBottom: 12,
    marginTop: 2,
  },
  bigHeroTitle: {
    fontSize: 50,
    lineHeight: 52,
    letterSpacing: -1.6,
    color: '#18181B',
  },
  heroLogoCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 14,
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
    marginTop: 4,
    marginBottom: 8,
  },
  animatedDot: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#18181B',
  },
  bottomDock: {
    paddingHorizontal: 22,
    paddingTop: 10,
    backgroundColor: 'transparent',
    zIndex: 10,
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

