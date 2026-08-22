import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

import { theme } from './src/theme';
import { SessionProvider, useSession } from './src/state/session';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FeedScreen from './src/screens/FeedScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PostScreen from './src/screens/PostScreen';
import ComposeScreen from './src/screens/ComposeScreen';
import ChatScreen from './src/screens/ChatScreen';
import StoreScreen from './src/screens/StoreScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.pageBg } };

const ICONS: Record<string, any> = {
  Home: 'home', Search: 'search', Alerts: 'notifications', DMs: 'mail', Me: 'person',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.orange,
        tabBarInactiveTintColor: '#8ea3cf',
        tabBarStyle: { backgroundColor: theme.stripNavy, borderTopColor: '#1a2a5e' },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name] || 'ellipse'} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="DMs" component={MessagesScreen} options={{ title: 'DMs' }} />
      <Tab.Screen name="Me" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useSession();
  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.orange} size="large" /></View>;
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Post" component={PostScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Store" component={StoreScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Compose" component={ComposeScreen} options={{ presentation: 'modal' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        if (__DEV__) return;
        const res = await Updates.checkForUpdateAsync();
        if (res.isAvailable) { await Updates.fetchUpdateAsync(); }
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <SessionProvider>
          <Root />
        </SessionProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.pageBg },
});
