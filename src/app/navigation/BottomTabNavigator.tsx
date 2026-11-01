import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { LearnScreen } from '../../features/learn/screens/LearnScreen';
import { PracticeScreen } from '../../features/practice/screens/PracticeScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { useTheme } from '../../shared/theme';
import { AppText } from '../../shared/components';

const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeTabLabel({ focused, color }: { focused: boolean; color: string }) {
  return (
    <AppText variant="caption" weight={focused ? 'bold' : 'regular'} color={color}>
      Home
    </AppText>
  );
}

function HomeTabIcon({ color }: { color: string }) {
  return <AppText variant="body" color={color}>🏠</AppText>;
}

function LearnTabLabel({ focused, color }: { focused: boolean; color: string }) {
  return (
    <AppText variant="caption" weight={focused ? 'bold' : 'regular'} color={color}>
      Learn
    </AppText>
  );
}

function LearnTabIcon({ color }: { color: string }) {
  return <AppText variant="body" color={color}>📚</AppText>;
}

function PracticeTabLabel({ focused, color }: { focused: boolean; color: string }) {
  return (
    <AppText variant="caption" weight={focused ? 'bold' : 'regular'} color={color}>
      Practice
    </AppText>
  );
}

function PracticeTabIcon({ color }: { color: string }) {
  return <AppText variant="body" color={color}>✍️</AppText>;
}

function ProfileTabLabel({ focused, color }: { focused: boolean; color: string }) {
  return (
    <AppText variant="caption" weight={focused ? 'bold' : 'regular'} color={color}>
      Profile
    </AppText>
  );
}

function ProfileTabIcon({ color }: { color: string }) {
  return <AppText variant="body" color={color}>👤</AppText>;
}

export function BottomTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.pythonYellow,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: HomeTabLabel,
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: LearnTabLabel,
          tabBarIcon: LearnTabIcon,
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: PracticeTabLabel,
          tabBarIcon: PracticeTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ProfileTabLabel,
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
