import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Message, getThread, sendMessage } from '../lib/api';
import { useSession } from '../state/session';

export default function ChatScreen({ route, navigation }: any) {
  const { partner } = route.params;
  const { user } = useSession();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try { setMsgs(await getThread(user!.name, partner)); } catch { setMsgs([]); }
    finally { setLoading(false); }
  }, [user, partner]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    // optimistic
    setMsgs((m) => [...m, { id: 'tmp' + Date.now(), sender: user!.name, recipient: partner, text: body, created_at: new Date().toISOString() }]);
    try { await sendMessage(user!.name, partner, body); await load(); } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>{partner}</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={theme.orange} />
        ) : (
          <FlatList
            ref={listRef}
            data={msgs}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ padding: 10 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const mine = item.sender === user!.name;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.bTxt, mine && { color: '#fff' }]}>{item.body}</Text>
                </View>
              );
            }}
          />
        )}
        <View style={styles.composer}>
          <TextInput style={styles.cInput} placeholder="Message…" placeholderTextColor="#9fb2d8" value={text} onChangeText={setText} />
          <Pressable style={[styles.cBtn, !text.trim() && { opacity: 0.5 }]} onPress={send} disabled={!text.trim()}>
            <Text style={styles.cBtnTxt}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.stripNavy },
  back: { color: theme.textDim, fontSize: 26, width: 24 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, marginVertical: 3 },
  mine: { backgroundColor: theme.orange, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { backgroundColor: '#dfeefb', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bTxt: { color: theme.navy, fontSize: 15 },
  composer: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: theme.stripNavy, alignItems: 'center' },
  cInput: { flex: 1, backgroundColor: '#1c2a63', color: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#2f7ac9' },
  cBtn: { backgroundColor: theme.orange, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  cBtnTxt: { color: '#fff', fontWeight: 'bold' },
});
