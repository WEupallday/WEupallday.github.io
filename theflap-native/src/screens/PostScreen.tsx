import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { Reply, getReplies, addReply } from '../lib/api';
import { useSession } from '../state/session';

export default function PostScreen({ route, navigation }: any) {
  const { flap } = route.params;
  const { user } = useSession();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setReplies(await getReplies(flap.id));
    } catch {
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [flap.id]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await addReply(flap.id, user!.name, body);
      setText('');
      await load();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Flap</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          data={replies}
          keyExtractor={(r) => String(r.id)}
          ListHeaderComponent={
            <View style={styles.post}>
              <Pressable onPress={() => navigation.push('Profile', { name: flap.name })}>
                <Text style={styles.pName}>{flap.name}{flap.mood ? <Text style={styles.pMood}>  · {flap.mood}</Text> : null}</Text>
              </Pressable>
              <Text style={styles.pText}>{flap.body}</Text>
              <Text style={styles.pMeta}>♥ {flap.likes ?? 0}   ·   {replies.length} replies</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.reply}>
              <Pressable onPress={() => navigation.push('Profile', { name: item.name })}>
                <Text style={styles.rName}>{item.name}</Text>
              </Pressable>
              <Text style={styles.rText}>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={
            loading ? <ActivityIndicator style={{ marginTop: 20 }} color={theme.orange} />
              : <Text style={styles.empty}>No replies yet. Be first.</Text>
          }
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.cInput}
            placeholder="Reply…"
            placeholderTextColor="#9fb2d8"
            value={text}
            onChangeText={setText}
          />
          <Pressable style={[styles.cBtn, (!text.trim() || busy) && { opacity: 0.5 }]} onPress={send} disabled={!text.trim() || busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.cBtnTxt}>Send</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.stripNavy },
  back: { color: theme.textDim, fontSize: 15, width: 44 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  post: { backgroundColor: '#eaf4fc', margin: 10, borderRadius: radius.md, padding: 14, borderWidth: 2, borderColor: theme.cardBorder },
  pName: { color: theme.nameNavy, fontWeight: 'bold', fontSize: 16 },
  pMood: { color: theme.orangeDark, fontSize: 12, fontWeight: 'normal' },
  pText: { color: theme.navy, fontSize: 16, lineHeight: 22, marginTop: 6 },
  pMeta: { color: '#889', fontSize: 12, marginTop: 10 },
  reply: { backgroundColor: '#dfeefb', marginHorizontal: 10, marginBottom: 6, borderRadius: 8, padding: 10 },
  rName: { color: theme.nameNavy, fontWeight: 'bold', fontSize: 13 },
  rText: { color: theme.navy, fontSize: 14, marginTop: 2 },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 20 },
  composer: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: theme.stripNavy, alignItems: 'center' },
  cInput: { flex: 1, backgroundColor: '#1c2a63', color: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#2f7ac9' },
  cBtn: { backgroundColor: theme.orange, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  cBtnTxt: { color: '#fff', fontWeight: 'bold' },
});
