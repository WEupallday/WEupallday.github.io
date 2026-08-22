import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Flap } from '../lib/flaps';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', excited: '🤩', chill: '😎', cool: '😎', bored: '😐',
  irritated: '😠', angry: '😡', mad: '😡', sad: '😢', crying: '😭',
  silly: '🤪', love: '😍', wondering: '🤔', curious: '🤔', tired: '😴',
  laughing: '😂', shocked: '😲', wink: '😉', hungry: '😋', sleepy: '😴',
};

function moodEmoji(m?: string | null) {
  if (!m) return '🐦';
  return MOOD_EMOJI[m.toLowerCase()] || '🐦';
}

function initials(name: string) {
  return (name || '?').trim().slice(0, 2).toUpperCase();
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function FlapCardBase({ flap }: { flap: Flap }) {
  return (
    <View style={styles.card}>
      {/* navy date strip */}
      <LinearGradient colors={[theme.stripTop, theme.stripNavy]} style={styles.strip}>
        <Text style={styles.stripDate}>
          {fmtDate(flap.created_at)}
          <Text style={styles.rate}>   ·   Rating: {flap.likes ?? 0} Flaps</Text>
        </Text>
      </LinearGradient>

      {/* cyan -> teal -> green body */}
      <LinearGradient
        colors={[theme.bodyTop, theme.bodyMid, theme.bodyBot]}
        locations={[0, 0.55, 1]}
        style={styles.body}
      >
        <View style={styles.headRow}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials(flap.name)}</Text></View>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={2}>{flap.name}</Text>
          </View>
          <View style={styles.moodbox}>
            <Text style={styles.mlabel}>Mood</Text>
            <Text style={styles.emo}>{moodEmoji(flap.mood)}</Text>
            <Text style={styles.mword} numberOfLines={1}>{(flap.mood || '').toLowerCase()}</Text>
          </View>
        </View>

        <Text style={styles.text}>{flap.text}</Text>

        <View style={styles.foot}>
          <Text style={styles.footBtn}>💬 Flap This! ({flap.likes ?? 0})</Text>
          <Text style={styles.footBtn}>↪ Reflap</Text>
          <Text style={styles.footShare}>⤴</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export const FlapCard = memo(FlapCardBase, (a, b) => a.flap.id === b.flap.id && a.flap.likes === b.flap.likes);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: theme.cardBorder,
    borderRadius: 3,
    marginHorizontal: 8,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  strip: { paddingHorizontal: 8, paddingVertical: 3, alignItems: 'flex-end' },
  stripDate: { color: theme.stripText, fontSize: 9, fontWeight: 'bold' },
  rate: { color: theme.rate, fontSize: 9, fontWeight: 'bold' },
  body: { padding: 12 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 46, height: 46, borderRadius: 6, backgroundColor: theme.nameNavy,
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  nameWrap: { flex: 1, paddingHorizontal: 8, paddingTop: 2 },
  name: { color: theme.nameNavy, fontWeight: 'bold', fontSize: 16 },
  moodbox: {
    width: 96, backgroundColor: '#fff', borderWidth: 3, borderColor: theme.red,
    borderRadius: 10, alignItems: 'center', paddingHorizontal: 4, paddingTop: 4, paddingBottom: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  mlabel: { color: theme.red, fontWeight: 'bold', fontSize: 14 },
  emo: { fontSize: 24, marginTop: 2 },
  mword: { color: theme.red, fontWeight: 'bold', fontSize: 11 },
  text: { color: theme.navy, fontSize: 14, lineHeight: 20, marginTop: 10 },
  foot: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: 8,
  },
  footBtn: { color: theme.navy, fontSize: 12, fontWeight: '600' },
  footShare: { color: theme.navy, fontSize: 16, marginLeft: 'auto' },
});
