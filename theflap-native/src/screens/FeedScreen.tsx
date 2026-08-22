import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Flap, fetchFlaps } from '../lib/flaps';
import { FlapCard } from '../components/FlapCard';
import { AnnouncementCard, PollCard } from '../components/FeedWidgets';
import { getBlocked } from '../lib/social';
import { useSession } from '../state/session';

export default function FeedScreen({ navigation }: any) {
  const { user } = useSession();
  const [flaps, setFlaps] = useState<Flap[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initial, setInitial] = useState(true);
  const [tab, setTab] = useState<'all' | 'following'>('all');
  const endReached = useRef(false);

  const load = useCallback(async () => {
    const [rows, bl] = await Promise.all([fetchFlaps(), getBlocked()]);
    setBlocked(bl);
    setFlaps(rows);
    endReached.current = rows.length === 0;
  }, []);

  useEffect(() => { load().finally(() => setInitial(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || endReached.current || flaps.length === 0) return;
    setLoadingMore(true);
    try {
      const older = await fetchFlaps(flaps[flaps.length - 1].created_at);
      if (older.length === 0) endReached.current = true;
      else setFlaps((prev) => [...prev, ...older]);
    } finally { setLoadingMore(false); }
  }, [flaps, loadingMore]);

  const visible = flaps.filter((f) => !blocked.includes(f.name));

  const Header = (
    <View>
      {/* Announcement + Poll of the Day */}
      <AnnouncementCard />
      <PollCard />

      {/* Post composer card */}
      <Pressable onPress={() => navigation.navigate('Compose')} style={styles.composerCard}>
        <LinearGradient colors={[theme.composerTop, theme.composerBot]} style={styles.composerBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.composerTitle}>✍️  Tap here to post a flap!</Text>
            <Text style={styles.composerSub}>share a photo, a mood, whatever — it goes live for all your friends</Text>
          </View>
          <View style={styles.postBtn}><Text style={styles.postBtnTxt}>POST</Text></View>
        </LinearGradient>
      </Pressable>

      {/* live strip */}
      <View style={styles.liveStrip}>
        <Text style={styles.liveTxt}>LIVE FLAPS — THE FRIENDS FEED  <Text style={styles.liveDot}>● LIVE</Text></Text>
      </View>

      {/* tabs */}
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'all' && styles.tabOn]} onPress={() => setTab('all')}>
          <Text style={[styles.tabTxt, tab === 'all' && styles.tabTxtOn]}>🐦 All flaps</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'following' && styles.tabOn]} onPress={() => setTab('following')}>
          <Text style={[styles.tabTxt, tab === 'following' && styles.tabTxtOn]}>★ Following</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Bubbly brand header */}
      <View style={styles.topbar}>
        <Text style={styles.brand}>
          <Text style={styles.brandThe}>the</Text><Text style={styles.brandFlap}>FLAP</Text><Text style={styles.brandApp}>.app</Text>
        </Text>
        <Text style={styles.tagline}>WHERE EVERYBODY FLAPS!</Text>
      </View>

      {initial ? (
        <View style={styles.center}><ActivityIndicator color={theme.orange} size="large" /></View>
      ) : (
        <FlashList
          data={visible}
          keyExtractor={(f) => String(f.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('Post', { flap: item })}>
              <FlapCard flap={item} onBlocked={(name) => setBlocked((b) => [...b, name])} />
            </Pressable>
          )}
          estimatedItemSize={280}
          ListHeaderComponent={Header}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.6}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.orange} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={theme.orange} /> : <View style={{ height: 90 }} />}
          ListEmptyComponent={<Text style={styles.empty}>No flaps yet.</Text>}
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('Compose')}>
        <Text style={styles.fabTxt}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  topbar: { alignItems: 'center', paddingTop: 6, paddingBottom: 8, backgroundColor: theme.stripNavy },
  brand: { fontSize: 30, fontWeight: '900' },
  brandThe: { color: '#fff', fontSize: 20, fontWeight: '800' },
  brandFlap: { color: theme.orange, fontSize: 30, fontWeight: '900', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 1 },
  brandApp: { color: '#fff', fontSize: 15, fontWeight: '800' },
  tagline: { color: theme.orange, fontSize: 9, fontWeight: 'bold', letterSpacing: 2, marginTop: -2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 40 },

  composerCard: {
    backgroundColor: '#fff', borderWidth: 3, borderColor: theme.cardBorder, borderRadius: 3,
    marginHorizontal: 8, marginTop: 2, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  composerBody: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  composerTitle: { color: theme.navy, fontWeight: 'bold', fontSize: 15 },
  composerSub: { color: '#33506b', fontSize: 11, marginTop: 3, lineHeight: 15 },
  postBtn: { backgroundColor: theme.orange, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12, borderWidth: 2, borderColor: theme.orangeDark },
  postBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

  liveStrip: { backgroundColor: theme.stripNavy, marginHorizontal: 8, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 10 },
  liveTxt: { color: theme.orange, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  liveDot: { color: '#37e07a', fontSize: 10, fontWeight: 'bold' },

  tabs: { flexDirection: 'row', marginHorizontal: 8, marginTop: 8, marginBottom: 4, gap: 6 },
  tab: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: theme.orange, borderRadius: 6, paddingVertical: 9, alignItems: 'center' },
  tabOn: { backgroundColor: theme.orange },
  tabTxt: { color: theme.orangeDark, fontWeight: 'bold', fontSize: 12 },
  tabTxtOn: { color: '#fff' },

  fab: { position: 'absolute', right: 18, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: theme.orange, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.orangeDark, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  fabTxt: { color: '#fff', fontSize: 30, marginTop: -2 },
});
