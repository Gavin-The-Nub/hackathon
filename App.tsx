import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookOpen, Dumbbell, Award, User } from 'lucide-react-native';

import { useUserStore } from './src/state/userStore';
import { LIGHT_THEME, DARK_THEME } from './src/ui/theme/tokens';

import { LearnScreen } from './src/ui/screens/LearnScreen';
import { PracticeScreen } from './src/ui/screens/PracticeScreen';
import { MasteryScreen } from './src/ui/screens/MasteryScreen';
import { MeScreen } from './src/ui/screens/MeScreen';
import { ProblemScreen } from './src/ui/screens/ProblemScreen';
import { CompletionScreen } from './src/ui/screens/CompletionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const themeMode = useUserStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface2,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Mastery"
        component={MasteryScreen}
        options={{
          tabBarLabel: 'Mastery',
          tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{
          tabBarLabel: 'Me',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const themeMode = useUserStore((s) => s.theme);
  const loadFromDb = useUserStore((s) => s.loadFromDb);
  const systemScheme = useColorScheme();

  useEffect(() => {
    loadFromDb();
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Problem" component={ProblemScreen} />
        <Stack.Screen name="Completion" component={CompletionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
