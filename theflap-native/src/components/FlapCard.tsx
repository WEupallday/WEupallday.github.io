import React, { memo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { Flap } from '../lib/flaps';
import { MoodFace } from './MoodFace';
import { useSession } from '../state/session';
import { likeFlap, reflap, reportFlap, blockUser, translate, parseReflap } from '../lib/social';

function initials(name: string) {
  return (name || '?').trim().slice(0, 2).toUpperCase();
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function FlapCardBase({ flap, onBlocked }: { flap: Flap; onBlocked?: (name: string) => void }) {
  const navigation = useNavigation<any>();
  const { user } = useSession();
  const isAdmin = user?.name === 'lock';

  const rf = parseReflap(flap.body);
  const displayBody = rf.isReflap ? (rf.origBody || '') : flap.body;

  const [likes, setLikes] = useState(flap.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [busyT, setBusyT] = useState(false);

  const nameColor = flap.color || theme.nameNavy;

  const onLike = async () => {
    if (liked) return;
    setLiked(true);
    const n = likes + 1;
    setLikes(n);
    await likeFlap(flap.id, likes);
  };

  const onReflap = () => {
    if (!user) return;
    Alert.alert('Reflap this?', 'Share ' + flap.name + "'s flap to your feed.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reflap', onPress: async () => { try { await reflap(user.name, flap); Alert.alert('Reflapped!'); } catch { Alert.alert('Could not reflap.'); } } },
    ]);
  };

  const onReply = () => navigation.navigate('Post', { flap });

  const onShare = async () => {
    try { await Share.share({ message: flap.name + ' on TheFlap: ' + displayBody + '\n\nhttps://theflap.app' }); } catch {}
  };

  const onTranslate = async () => {
    if (translated) { setTranslated(null); return; }
    setBusyT(true);
    const t = await translate(displayBody);
    setTranslated(t);
    setBusyT(false);
  };

  const onReport = () => {
    Alert.alert('Report this flap?', 'Our moderation team will review it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: async () => { if (user) await reportFlap(flap, user.name); Alert.alert('Reported', 'Thanks — we\'ll take a look.'); } },
    ]);
  };

  const onBlock = () => {
    Alert.alert('Block ' + flap.name + '?', 'You won\'t see their flaps anymore.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: async () => { await blockUser(flap.name); onBlocked?.(flap.name); } },
    ]);
  };

  const onPin = () => Alert.alert('Pin flap', 'Spotlight this flap at the top of the feed (admin).');

  return (
    <View style={styles.card}>
      {/* navy date strip */}
      <LinearGradient colors={[theme.stripTop, theme.stripNavy]} style={styles.strip}>
        <Text style={styles.stripDate}>
          {fmtDate(flap.created_at)}
          <Text style={styles.rate}>   ·   Rating: {likes} Flaps</Text>
        </Text>
      </LinearGradient>

      {/* cyan -> teal -> green body */}
      <LinearGradient colors={[theme.bodyTop, theme.bodyMid, theme.bodyBot]} locations={[0, 0.55, 1]} style={styles.body}>
        {rf.isReflap && (
          <Text style={styles.reflapTag}>🔁 {flap.name} reflapped this</Text>
        )}

        <View style={styles.headRow}>
          <Pressable onPress={() => navigation.navigate('Profile', { name: rf.isReflap ? (rf.by || flap.name) : flap.name })}>
            {flap.avatar_url ? (
              <Image source={{ uri: flap.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials(flap.name)}</Text></View>
            )}
          </Pressable>
          <View style={styles.nameWrap}>
            <Text style={[styles.name, { color: nameColor }]} numberOfLines={2}>{flap.name}</Text>
          </View>
          <View style={styles.moodbox}>
            <Text style={styles.mlabel}>Mood</Text>
            <MoodFace mood={flap.mood} size={38} />
            <Text style={styles.mword} numberOfLines={1}>{(flap.mood || '').toLowerCase()}</Text>
          </View>
        </View>

        {!!displayBody && <Text style={styles.text}>{translated || displayBody}</Text>}
        {!!translated && <Text style={styles.translated}>translated</Text>}

        {!!flap.pic_url && <Image source={{ uri: flap.pic_url }} style={styles.pic} resizeMode="cover" />}

        {/* primary actions */}
        <View style={styles.foot}>
          <Pressable style={styles.actBtn} onPress={onLike} hitSlop={6}>
            <Text style={[styles.actTxt, liked && styles.liked]}>🐦 Flap This!{likes ? ' (' + likes + ')' : ''}</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onReflap} hitSlop={6}>
            <Text style={styles.actTxt}>🔁 Reflap</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onReply} hitSlop={6}>
            <Text style={styles.actTxt}>↩ Reply</Text>
          </Pressable>
        </View>

        {/* secondary actions */}
        <View style={styles.foot2}>
          <Pressable style={styles.actBtn} onPress={onTranslate} hitSlop={6}>
            <Text style={styles.act2}>{busyT ? '…' : translated ? '🌐 Original' : '🌐 Translate'}</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onShare} hitSlop={6}>
            <Text style={styles.act2}>⤴ Share</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onReport} hitSlop={6}>
            <Text style={styles.act2}>🚩 Report</Text>
          </Pressable>
          <Pressable style={styles.actBtn} onPress={onBlock} hitSlop={6}>
            <Text style={styles.act2}>🚫 Block</Text>
          </Pressable>
          {isAdmin && (
            <Pressable style={styles.actBtn} onPress={onPin} hitSlop={6}>
              <Text style={styles.act2}>📌 Pin</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

export const FlapCard = memo(FlapCardBase, (a, b) => a.flap.id === b.flap.id && a.flap.likes === b.flap.likes);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderWidth: 3, borderColor: theme.cardBorder, borderRadius: 3,
    marginHorizontal: 8, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  strip: { paddingHorizontal: 8, paddingVertical: 3, alignItems: 'flex-end' },
  stripDate: { color: theme.stripText, fontSize: 9, fontWeight: 'bold' },
  rate: { color: theme.rate, fontSize: 9, fontWeight: 'bold' },
  body: { padding: 12 },
  reflapTag: { color: '#0c5b3a', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 46, height: 46, borderRadius: 6, backgroundColor: theme.nameNavy,
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  nameWrap: { flex: 1, paddingHorizontal: 8, paddingTop: 2 },
  name: { fontWeight: 'bold', fontSize: 16 },
  moodbox: {
    width: 96, backgroundColor: '#fff', borderWidth: 3, borderColor: theme.red,
    borderRadius: 10, alignItems: 'center', paddingHorizontal: 4, paddingTop: 4, paddingBottom: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  mlabel: { color: theme.red, fontWeight: 'bold', fontSize: 14 },
  mword: { color: theme.red, fontWeight: 'bold', fontSize: 11, marginTop: 1 },
  text: { color: theme.navy, fontSize: 14, lineHeight: 20, marginTop: 10 },
  translated: { color: '#0c5b3a', fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  pic: { width: '100%', height: 220, borderRadius: 8, marginTop: 10, backgroundColor: '#0002' },
  foot: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: 8,
  },
  foot2: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8, gap: 14 },
  actBtn: {},
  actTxt: { color: theme.navy, fontSize: 12, fontWeight: '700' },
  act2: { color: '#1c3a5e', fontSize: 11, fontWeight: '600' },
  liked: { color: theme.orangeDark },
});
