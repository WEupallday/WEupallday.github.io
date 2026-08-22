import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { login } from '../lib/auth';
import { useSession } from '../state/session';

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useSession();
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    setErr('');
    setBusy(true);
    try {
      const u = await login(name, pass);
      setUser(u);
    } catch (e: any) {
      setErr(e.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        <Text style={styles.brand}>TheFlap</Text>
        <Text style={styles.tag}>Welcome back.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9fb2d8"
          autoCapitalize="none"
          autoCorrect={false}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9fb2d8"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
          onSubmitEditing={onLogin}
        />

        {!!err && <Text style={styles.err}>{err}</Text>}

        <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={onLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>Log in</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={10}>
          <Text style={styles.link}>New here? Create an account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },
  brand: { color: theme.orange, fontSize: 40, fontWeight: 'bold', textAlign: 'center' },
  tag: { color: theme.textDim, textAlign: 'center', marginBottom: 26, marginTop: 4 },
  input: {
    backgroundColor: '#1c2a63', color: '#fff', borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#2f7ac9',
  },
  btn: {
    backgroundColor: theme.orange, borderRadius: radius.md, paddingVertical: 14,
    alignItems: 'center', marginTop: 6,
  },
  btnBusy: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: theme.textDim, textAlign: 'center', marginTop: 20, fontSize: 14 },
  err: { color: '#ffb4b4', marginBottom: 10, textAlign: 'center' },
});
