import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { getProfile, getUserFlaps, getFollowState, getFollowerCount, setFollow, Profile } from '../lib/api';
import { Flap } from '../lib/flaps';
import { FlapCard } from '../components/FlapCard';
import { useSession } from '../state/session';

export default function ProfileScreen({ route, navigation }: any) {
  const { user } = useSession();
  const name: string = route?.params?.name || user!.name;
  const isMe = name === user!.name;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [flaps, setFlaps] = useState<Flap[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [p, f, fc] = await Promise.all([
      getProfile(name),
      getUserFlaps(name),
      getFollowerCount(name),
    ]);
    setProfile(p);
    setFlaps(f as Flap[]);
    setFollowers(fc);
    if (!isMe) setFollowing(await getFollowState(user!.name, name));
    setLoading(false);
  }, [name, isMe, user]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = async () => {
    const next = !following;
    setFollowing(next);
    setFollowers((c) => c + (next ? 1 : -1));
    try { await setFollow(user!.name, name, next); } catch { /* revert on fail */ setFollowing(!next); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={theme.orange} size="large" />
      ) : (
        <FlashList
          data={flaps}
          keyExtractor={(f) => String(f.id)}
          estimatedItemSize={110}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('Post', { flap: item })}>
              <FlapCard flap={item} />
            </Pressable>
          )}
          ListHeaderComponent={
            <View style={styles.head}>
              <View style={styles.avatar}><Text style={styles.avatarTxt}>{name.slice(0, 2).toUpperCase()}</Text></View>
              <Text style={styles.name}>
                {name}{profile?.verified ? ' ✓' : ''}{profile?.premium ? ' ★' : ''}
              </Text>
              {!!profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
              <Text style={styles.stat}>{followers.toLocaleString()} followers</Text>
              {!isMe && (
                <Pressable style={[styles.follow, following && styles.followingBtn]} onPress={toggleFollow}>
                  <Text style={[styles.followTxt, following && styles.followingTxt]}>{following ? 'Following' : 'Follow'}</Text>
                </Pressable>
              )}
              {isMe && (
                <View style={styles.meRow}>
                  <Pressable style={styles.settings} onPress={() => navigation.navigate('Store')}>
                    <Text style={styles.settingsTxt}>🪶 Store</Text>
                  </Pressable>
                  <Pressable style={styles.settings} onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.settingsTxt}>Settings</Text>
                  </Pressable>
                </View>
              )}
              <Text style={styles.section}>Flaps</Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>No flaps yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.stripNavy },
  back: { color: theme.textDim, fontSize: 15, width: 44 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' },
  head: { alignItems: 'center', padding: 18 },
  avatar: { width: 74, height: 74, borderRadius: 14, backgroundColor: theme.nameNavy, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 26 },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginTop: 10 },
  bio: { color: theme.textDim, fontSize: 13, marginTop: 4, textAlign: 'center' },
  stat: { color: theme.textDim, fontSize: 13, marginTop: 6 },
  follow: { backgroundColor: theme.orange, borderRadius: 20, paddingHorizontal: 26, paddingVertical: 9, marginTop: 12 },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2f7ac9' },
  followTxt: { color: '#fff', fontWeight: 'bold' },
  followingTxt: { color: theme.textDim },
  meRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  settings: { borderWidth: 1, borderColor: '#2f7ac9', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 9 },
  settingsTxt: { color: theme.textDim, fontWeight: '600' },
  section: { color: theme.textDim, alignSelf: 'flex-start', fontSize: 12, textTransform: 'uppercase', marginTop: 18 },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 20 },
});
