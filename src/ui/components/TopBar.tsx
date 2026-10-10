import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar as RNStatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JavaScriptLogo, PythonLogo } from './LanguageLogos';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const themeMode = useUserStore((s) => s.theme);
  const level = useUserStore((s) => s.level);
  const selectedLanguage = useUserStore((s) => s.selectedLanguage);

  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 36) : 0;
  const safeTop = Math.max(insets.top, androidBarHeight, 44);
  const topPadding = safeTop + 8;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.surface2,
          paddingTop: topPadding,
        },
      ]}
    >
      {/* Language Switcher */}
      <TouchableOpacity
        style={[styles.langSwitcher, { backgroundColor: colors.surface, borderColor: colors.surface2 }]}
        onPress={() => navigation.navigate('PathSelection')}
        activeOpacity={0.8}
      >
        <View style={styles.langIconWrap}>
          {selectedLanguage === 'python' ? (
            <PythonLogo size={18} />
          ) : (
            <JavaScriptLogo size={18} />
          )}
        </View>
        <Text style={[styles.langText, { color: colors.text }]}>
          {selectedLanguage === 'python' ? 'Python' : 'JavaScript'}
        </Text>
        <ChevronDown size={14} color={colors.textMuted} strokeWidth={2.6} />
      </TouchableOpacity>

      <View style={styles.rightGroup}>
        {/* Level */}
        <View style={[styles.levelPill, { backgroundColor: colors.primary }]}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  langSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3,
  },
  langIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sandboxIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
