import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Play, ChevronDown, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

export interface SymbolBarProps {
  onInsertSymbol: (symbol: string) => void;
  onRunTests?: () => void;
  isRunning?: boolean;
  isKeyboardVisible?: boolean;
  language?: 'javascript' | 'python';
  onDismissKeyboard?: () => void;
}

const JS_SYMBOLS = [
  { label: 'Tab', val: 'tab' },
  { label: '{ }', val: '{}' },
  { label: '( )', val: '()' },
  { label: '[ ]', val: '[]' },
  { label: '" "', val: '""' },
  { label: "' '", val: "''" },
  { label: ';', val: ';' },
  { label: ':', val: ':' },
  { label: '=', val: '=' },
  { label: '=>', val: ' => ' },
  { label: '===', val: ' === ' },
  { label: '!==', val: ' !== ' },
  { label: '<', val: '<' },
  { label: '>', val: '>' },
  { label: '+', val: '+' },
  { label: '-', val: '-' },
  { label: '*', val: '*' },
  { label: '/', val: '/' },
  { label: '%', val: '%' },
  { label: '!', val: '!' },
  { label: '&&', val: ' && ' },
  { label: '||', val: ' || ' },
];

const PYTHON_SYMBOLS = [
  { label: 'Tab', val: 'tab' },
  { label: ':', val: ':' },
  { label: '( )', val: '()' },
  { label: '[ ]', val: '[]' },
  { label: '{ }', val: '{}' },
  { label: '" "', val: '""' },
  { label: "' '", val: "''" },
  { label: '=', val: '=' },
  { label: '==', val: ' == ' },
  { label: '!=', val: ' != ' },
  { label: '<', val: '<' },
  { label: '>', val: '>' },
  { label: '+', val: '+' },
  { label: '-', val: '-' },
  { label: '*', val: '*' },
  { label: '/', val: '/' },
  { label: '%', val: '%' },
  { label: 'in', val: ' in ' },
  { label: 'and', val: ' and ' },
  { label: 'or', val: ' or ' },
  { label: 'not', val: 'not ' },
];

export function SymbolBar({
  onInsertSymbol,
  onRunTests,
  isRunning = false,
  isKeyboardVisible = false,
  language = 'javascript',
  onDismissKeyboard,
}: SymbolBarProps) {
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const symbols = language === 'python' ? PYTHON_SYMBOLS : JS_SYMBOLS;

  const handleDismiss = () => {
    if (onDismissKeyboard) {
      onDismissKeyboard();
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface2,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {symbols.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={[
              styles.btn,
              {
                backgroundColor: colors.surface2,
              },
            ]}
            onPress={() => onInsertSymbol(s.val)}
            activeOpacity={0.65}
            accessibilityLabel={`Insert ${s.label}`}
          >
            <Text style={[styles.btnText, { color: colors.text }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Docked Action Group visible when keyboard is active */}
      {isKeyboardVisible && (
        <View style={styles.rightGroup}>
          {onRunTests && (
            <TouchableOpacity
              style={[
                styles.compactRunBtn,
                {
                  backgroundColor: isRunning ? colors.textMuted : colors.primary,
                  borderBottomColor: colors.primaryLip,
                },
              ]}
              onPress={onRunTests}
              disabled={isRunning}
              activeOpacity={0.8}
              accessibilityLabel="Run Code"
            >
              {isRunning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
              )}
              <Text style={styles.compactRunText}>{isRunning ? '...' : 'Run'}</Text>
            </TouchableOpacity>
          )}

          {/* Quick Dismiss Keyboard Button */}
          <TouchableOpacity
            style={[styles.dismissBtn, { backgroundColor: colors.surface2 }]}
            onPress={handleDismiss}
            activeOpacity={0.7}
            accessibilityLabel="Hide keyboard"
          >
            <ChevronDown size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    minWidth: 42,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    paddingLeft: 4,
  },
  compactRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: 3,
  },
  compactRunText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  dismissBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
