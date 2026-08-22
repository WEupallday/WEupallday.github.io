import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getConversations } from '../lib/api';
import { useSession } from '../state/session';

export default function MessagesScreen({ navigation }: any) {
  const { user } = useSession();
  const [convos, setConvos] = useState<{ partner: string; last: string; at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setConvos(await getConversations(user!.name)); } catch { setConvos([]); }
    finally { setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.h}>Messages</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={theme.orange} />
      ) : (
        <FlatList
          data={convos}
          keyExtractor={(c) => c.partner}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate('Chat', { partner: item.partner })}>
              <View style={styles.ava}><Text style={styles.avaTxt}>{item.partner.slice(0, 2).toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.partner}</Text>
                <Text style={styles.last} numberOfLines={1}>{item.last}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No conversations yet. Open someone's profile to message them.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  h: { color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 12 },
  ava: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.nameNavy, alignItems: 'center', justifyContent: 'center' },
  avaTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600' },
  last: { color: theme.textDim, fontSize: 13, marginTop: 2 },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 24, paddingHorizontal: 30, lineHeight: 20 },
});
