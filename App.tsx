import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Keyboard, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Dumbbell, Award, User, Code2 } from 'lucide-react-native';

import { useUserStore } from './src/state/userStore';
import { LIGHT_THEME, DARK_THEME } from './src/ui/theme/tokens';

import { LearnScreen } from './src/ui/screens/LearnScreen';
import { PracticeScreen } from './src/ui/screens/PracticeScreen';
import { MasteryScreen } from './src/ui/screens/MasteryScreen';
import { MeScreen } from './src/ui/screens/MeScreen';
import { ProblemScreen } from './src/ui/screens/ProblemScreen';
import { CompletionScreen } from './src/ui/screens/CompletionScreen';
import { PathSelectionScreen } from './src/ui/screens/PathSelectionScreen';
import { LessonScreen } from './src/ui/screens/LessonScreen';
import { SandboxScreen } from './src/ui/screens/SandboxScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const themeMode = useUserStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomInset = Math.max(insets.bottom, 12);
  const tabHeight = 56 + bottomInset;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: isKeyboardVisible
            ? { display: 'none', height: 0 }
            : {
                backgroundColor: colors.surface,
                borderTopColor: colors.surface2,
                borderTopWidth: 1.5,
                height: tabHeight,
                paddingBottom: bottomInset,
                paddingTop: 8,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
              },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="Learn"
          component={LearnScreen}
          options={{
            tabBarLabel: 'Learn',
            tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={2.4} />,
          }}
        />
        <Tab.Screen
          name="Practice"
          component={PracticeScreen}
          options={{
            tabBarLabel: 'Practice',
            tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} strokeWidth={2.4} />,
          }}
        />
        <Tab.Screen
          name="Sandbox"
          component={SandboxScreen}
          options={{
            tabBarLabel: 'Sandbox',
            tabBarIcon: ({ color, size }) => <Code2 color={color} size={size} strokeWidth={2.4} />,
          }}
        />
        <Tab.Screen
          name="Mastery"
          component={MasteryScreen}
          options={{
            tabBarLabel: 'Mastery',
            tabBarIcon: ({ color, size }) => <Award color={color} size={size} strokeWidth={2.4} />,
          }}
        />
        <Tab.Screen
          name="Me"
          component={MeScreen}
          options={{
            tabBarLabel: 'Me',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.4} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  const themeMode = useUserStore((s) => s.theme);
  const loadFromDb = useUserStore((s) => s.loadFromDb);
  const hasSelectedLanguage = useUserStore((s) => s.hasSelectedLanguage);
  const isLoaded = useUserStore((s) => s.isLoaded);
  const systemScheme = useColorScheme();

  useEffect(() => {
    loadFromDb();
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack.Navigator
          initialRouteName={hasSelectedLanguage ? 'MainTabs' : 'PathSelection'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="PathSelection" component={PathSelectionScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Lesson" component={LessonScreen} />
          <Stack.Screen name="Problem" component={ProblemScreen} />
          <Stack.Screen name="Completion" component={CompletionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
