import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { postFlap } from '../lib/flaps';
import { useSession } from '../state/session';

const MOODS = ['happy', 'excited', 'chill', 'bored', 'irritated', 'sad', 'silly', 'love'];

export default function ComposeScreen({ navigation }: any) {
  const { user } = useSession();
  const [text, setText] = useState('');
  const [mood, setMood] = useState('happy');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await postFlap(user!.name, body, mood);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not post', e.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.post, (!text.trim() || busy) && styles.postOff]} onPress={submit} disabled={!text.trim() || busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.postTxt}>Flap</Text>}
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="What's happening?"
        placeholderTextColor="#9fb2d8"
        multiline
        autoFocus
        maxLength={500}
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.label}>Mood</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
        {MOODS.map((m) => (
          <Pressable key={m} onPress={() => setMood(m)} style={[styles.chip, mood === m && styles.chipOn]}>
            <Text style={[styles.chipTxt, mood === m && styles.chipTxtOn]}>{m}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  cancel: { color: theme.textDim, fontSize: 15 },
  post: { backgroundColor: theme.orange, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  postOff: { opacity: 0.5 },
  postTxt: { color: '#fff', fontWeight: 'bold' },
  input: { color: '#fff', fontSize: 18, paddingHorizontal: 16, minHeight: 120, textAlignVertical: 'top' },
  label: { color: theme.textDim, fontSize: 12, paddingHorizontal: 16, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
  moodRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 20 },
  chip: { backgroundColor: '#1c2a63', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#2f7ac9' },
  chipOn: { backgroundColor: theme.orange, borderColor: theme.orange },
  chipTxt: { color: '#cfe6ff', fontSize: 13 },
  chipTxtOn: { color: '#fff', fontWeight: 'bold' },
});
