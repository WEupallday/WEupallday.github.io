import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { signup } from '../lib/auth';
import { useSession } from '../state/session';

export default function SignupScreen({ navigation }: any) {
  const { setUser } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    setErr('');
    setBusy(true);
    try {
      const u = await signup(name, email, pass);
      setUser(u);
    } catch (e: any) {
      setErr(e.message || 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        <Text style={styles.brand}>Create account</Text>

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
          placeholder="Your email (required)"
          placeholderTextColor="#9fb2d8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.hint}>
          So we can send you updates and help reset your password if you forget it.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9fb2d8"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
          onSubmitEditing={onCreate}
        />

        {!!err && <Text style={styles.err}>{err}</Text>}

        <Pressable style={[styles.btn, busy && styles.btnBusy]} onPress={onCreate} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>Create account</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 },
  brand: { color: theme.orange, fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 22 },
  input: {
    backgroundColor: '#1c2a63', color: '#fff', borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#2f7ac9',
  },
  hint: { color: '#9fb2d8', fontSize: 12, marginTop: -6, marginBottom: 12, paddingHorizontal: 2, lineHeight: 16 },
  btn: {
    backgroundColor: theme.orange, borderRadius: radius.md, paddingVertical: 14,
    alignItems: 'center', marginTop: 6,
  },
  btnBusy: { opacity: 0.7 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: theme.textDim, textAlign: 'center', marginTop: 20, fontSize: 14 },
  err: { color: '#ffb4b4', marginBottom: 10, textAlign: 'center' },
});
