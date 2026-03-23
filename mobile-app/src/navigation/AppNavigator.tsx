import React, { useEffect, useMemo } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreSession } from '../store/slices/authSlice';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PracticeScreen from '../screens/main/PracticeScreen';
import PracticeModeSelectScreen from '../screens/main/PracticeModeSelectScreen';
import PracticeWriteScreen from '../screens/main/PracticeWriteScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SubmissionHistoryScreen from '../screens/main/SubmissionHistoryScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { PracticeStackParamList, ProfileStackParamList } from './types';
import { useAppSettings } from '../context/AppSettingsContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PracticeStack = createNativeStackNavigator<PracticeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  const { theme, t } = useAppSettings();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBg },
        headerTintColor: theme.headerText,
        headerTitleStyle: { fontWeight: '700', color: theme.headerText },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: t('nav_profile') }}
      />
      <ProfileStack.Screen
        name="SubmissionHistory"
        component={SubmissionHistoryScreen}
        options={{ title: t('history_title') }}
      />
    </ProfileStack.Navigator>
  );
}

function PracticeStackNavigator() {
  const { theme, t } = useAppSettings();
  return (
    <PracticeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBg },
        headerTintColor: theme.headerText,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <PracticeStack.Screen
        name="PracticeList"
        component={PracticeScreen}
        options={{ title: t('nav_practice') }}
      />
      <PracticeStack.Screen
        name="PracticeModeSelect"
        component={PracticeModeSelectScreen}
        options={{ title: t('nav_modeSelect') }}
      />
      <PracticeStack.Screen
        name="PracticeWrite"
        component={PracticeWriteScreen}
        options={{ title: t('nav_write') }}
      />
    </PracticeStack.Navigator>
  );
}

function MainTabs() {
  const { theme, t } = useAppSettings();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Practice"
        component={PracticeStackNavigator}
        options={{
          title: t('nav_practice'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: t('nav_profile'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const { theme, isDark } = useAppSettings();

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: theme.brand,
        background: theme.bg,
        card: theme.card,
        text: theme.text,
        border: theme.border,
        notification: theme.red[500],
      },
    }),
    [isDark, theme]
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
