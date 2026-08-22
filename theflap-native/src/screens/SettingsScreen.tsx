import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { theme, radius } from '../theme';
import { useSession } from '../state/session';

export default function SettingsScreen({ navigation }: any) {
  const { user, signOut } = useSession();

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can log back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>‹ Back</Text></Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.row}>Signed in as <Text style={styles.bold}>{user?.name}</Text></Text>
        {!!user?.email && <Text style={styles.row}>Email: {user.email}</Text>}
      </View>

      <Pressable style={styles.logout} onPress={confirmLogout}>
        <Text style={styles.logoutTxt}>Sign out</Text>
      </Pressable>

      <Text style={styles.ver}>TheFlap v{Constants.expoConfig?.version || '1.4.0'}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.stripNavy },
  back: { color: theme.textDim, fontSize: 15, width: 44 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#1c2a63', margin: 14, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: '#2f7ac9' },
  row: { color: '#fff', fontSize: 14, marginVertical: 3 },
  bold: { fontWeight: 'bold' },
  logout: { marginHorizontal: 14, marginTop: 6, borderWidth: 1, borderColor: theme.red, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
  logoutTxt: { color: '#ff8a8a', fontWeight: 'bold', fontSize: 15 },
  ver: { color: theme.textDim, textAlign: 'center', marginTop: 20, fontSize: 12 },
});
