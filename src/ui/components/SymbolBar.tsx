import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUserStore } from '../../state/userStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/tokens';

interface SymbolBarProps {
  onInsertSymbol: (symbol: string) => void;
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
  { label: '<', val: '<' },
  { label: '>', val: '>' },
  { label: '+', val: '+' },
  { label: '-', val: '-' },
  { label: '*', val: '*' },
  { label: '%', val: '%' },
];

export function SymbolBar({ onInsertSymbol }: SymbolBarProps) {
  const themeMode = useUserStore((s) => s.theme);
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.surface2 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SYMBOLS.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={[styles.btn, { backgroundColor: colors.surface2 }]}
            onPress={() => onInsertSymbol(s.val)}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, { color: colors.text }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    minWidth: 42,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
