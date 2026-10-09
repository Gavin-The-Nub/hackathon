import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

interface PathSelectionScreenProps {
  navigation: any;
  route?: any;
}

export function PathSelectionScreen({ navigation }: PathSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useUserStore((s) => s.theme);
  const selectedLanguage = useUserStore((s) => s.selectedLanguage);
  const hasSelectedLanguage = useUserStore((s) => s.hasSelectedLanguage);
  const setSelectedLanguage = useUserStore((s) => s.setSelectedLanguage);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const topPadding = Math.max(insets.top, androidBarHeight, 44) + 12;

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleSelectJavaScript = () => {
    setSelectedLanguage('javascript');
    if (navigation.canGoBack() && hasSelectedLanguage) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleSelectPython = () => {
    Alert.alert(
      'Python Path Coming Soon!',
      'Our team is crafting Python lessons and local AI models. Start with the JavaScript path today to master core programming fundamentals!',
      [
        { text: 'Start JavaScript', onPress: handleSelectJavaScript },
        { text: 'Got it', style: 'cancel' },
      ]
    );
  };

  const isJsActive = selectedLanguage === 'javascript' && hasSelectedLanguage;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding, borderBottomColor: colors.surface2 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.brandText, { color: colors.primary }]}>CodeChamp</Text>
          <View style={styles.offlinePill}>
            <Text style={styles.offlinePillText}>OFFLINE TUTOR</Text>
          </View>
        </View>

        {hasSelectedLanguage && (
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.8}
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>Choose Your Path</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Select a programming language to master with hands-on exercises and on-device AI guidance. You can switch at any time.
          </Text>
        </View>

        {/* Path Cards */}
        <View style={styles.cardsContainer}>
          {/* JAVASCRIPT CARD */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: isJsActive ? colors.primary : colors.surface2,
                borderBottomColor: isJsActive ? colors.primaryLip : colors.surface2,
              },
              isJsActive && styles.cardActive,
            ]}
            onPress={handleSelectJavaScript}
            activeOpacity={0.9}
          >
            {/* Card Header Row */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.langIdentity}>
                <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.iconBoxText}>JS</Text>
                </View>
                <View>
                  <Text style={[styles.langTitle, { color: colors.text }]}>JavaScript</Text>
                  <Text style={[styles.langLevel, { color: colors.textMuted }]}>5 Units · 25 Lessons</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isJsActive ? 'rgba(45, 184, 76, 0.15)' : 'rgba(91, 75, 219, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isJsActive ? colors.success : colors.primary },
                  ]}
                >
                  {isJsActive ? 'ACTIVE PATH' : 'READY TO LEARN'}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.cardDesc, { color: colors.text }]}>
              The language of the web and modern applications. JavaScript powers interactive user interfaces, mobile apps, and full-stack servers across the globe.
            </Text>

            {/* Career & Real-World Outcomes */}
            <View style={styles.outcomesSection}>
              <Text style={[styles.outcomesHeader, { color: colors.textMuted }]}>
                WHAT YOU CAN BUILD:
              </Text>
              <View style={styles.tagsWrap}>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>🌐 Web Development</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>📱 Mobile Apps (React Native)</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>💻 Full-Stack Software</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>🎮 Interactive Games</Text>
                </View>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[
                styles.selectBtn,
                {
                  backgroundColor: colors.primary,
                  borderBottomColor: colors.primaryLip,
                },
              ]}
              onPress={handleSelectJavaScript}
              activeOpacity={0.85}
            >
              <Text style={styles.selectBtnText}>
                {isJsActive ? 'CONTINUE JAVASCRIPT' : 'SELECT JAVASCRIPT'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* PYTHON CARD */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surface2,
                borderBottomColor: colors.surface2,
              },
            ]}
            onPress={handleSelectPython}
            activeOpacity={0.9}
          >
            {/* Card Header Row */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.langIdentity}>
                <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.iconBoxText}>PY</Text>
                </View>
                <View>
                  <Text style={[styles.langTitle, { color: colors.text }]}>Python</Text>
                  <Text style={[styles.langLevel, { color: colors.textMuted }]}>Coming in next update</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Text style={[styles.statusBadgeText, { color: '#3B82F6' }]}>COMING SOON</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.cardDesc, { color: colors.text }]}>
              The premier language for artificial intelligence, data science, and backend scripting. Renowned for its clean, beginner-friendly syntax and immense community.
            </Text>

            {/* Career & Real-World Outcomes */}
            <View style={styles.outcomesSection}>
              <Text style={[styles.outcomesHeader, { color: colors.textMuted }]}>
                WHAT YOU CAN BUILD:
              </Text>
              <View style={styles.tagsWrap}>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>🤖 AI & Machine Learning</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>📊 Data Science & Analytics</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>⚙️ Automation & Scripting</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.surface2 }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>☁️ Backend APIs & Cloud</Text>
                </View>
              </View>
            </View>

            {/* Secondary Action Button */}
            <TouchableOpacity
              style={[
                styles.previewBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.surface2,
                  borderBottomColor: colors.surface2,
                },
              ]}
              onPress={handleSelectPython}
              activeOpacity={0.8}
            >
              <Text style={[styles.previewBtnText, { color: colors.textMuted }]}>
                PREVIEW / NOTIFY ME
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  offlinePill: {
    backgroundColor: 'rgba(45, 184, 76, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offlinePillText: {
    color: '#2DB84C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 22,
  },
  titleSection: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    gap: 14,
  },
  cardActive: {
    borderWidth: 2.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  langTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  langLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  outcomesSection: {
    gap: 8,
  },
  outcomesHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    marginTop: 4,
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  previewBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    marginTop: 4,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
