import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Play } from 'lucide-react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

interface SymbolBarProps {
  onInsertSymbol: (symbol: string) => void;
  onRunTests?: () => void;
  isRunning?: boolean;
  isKeyboardVisible?: boolean;
}

const SYMBOLS = [
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

export function SymbolBar({
  onInsertSymbol,
  onRunTests,
  isRunning = false,
  isKeyboardVisible = false,
}: SymbolBarProps) {
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

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
        {SYMBOLS.map((s) => (
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
          >
            <Text style={[styles.btnText, { color: colors.text }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Docked compact Run button visible when keyboard is active */}
      {isKeyboardVisible && onRunTests && (
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
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          )}
          <Text style={styles.compactRunText}>{isRunning ? '...' : 'Run'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 50,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    minWidth: 44,
    height: 38,
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
  compactRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    borderBottomWidth: 3,
  },
  compactRunText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
