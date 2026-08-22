import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { getNotifs, Notif } from '../lib/api';
import { useSession } from '../state/session';

export default function NotificationsScreen() {
  const { user } = useSession();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getNotifs(user!.name)); } catch { setItems([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.h}>Notifications</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={theme.orange} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={theme.orange} />}
          renderItem={({ item }) => (
            <View style={[styles.row, !item.seen && styles.unread]}>
              <Text style={styles.txt}>{item.excerpt || item.kind}</Text>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nothing yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  h: { color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 14 },
  row: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)' },
  unread: { backgroundColor: 'rgba(245,130,10,.10)' },
  txt: { color: '#fff', fontSize: 14 },
  time: { color: theme.textDim, fontSize: 11, marginTop: 3 },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 24 },
});
