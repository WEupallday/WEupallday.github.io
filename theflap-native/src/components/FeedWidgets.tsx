import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { getDailyPoll, getPollResults, votePoll, getMyVote, setMyVote, Poll } from '../lib/social';
import { useSession } from '../state/session';

// ---- Announcement (pinned, from TheFlap official) -------------------------
const ANNOUNCE_TITLE = '🎉 Big update just dropped!';
const ANNOUNCE_BODY =
  'TheFlap is faster and smoother than ever — and we added a bunch you asked for:\n\n' +
  '• Full threads — tap any flap to open the whole conversation\n' +
  '• Reply to comments — jump right into the back-and-forth\n' +
  '• Share to Story — send your favorite flaps straight to your Story\n' +
  '• Translate — read any flap in your language with one tap\n' +
  '• Animated moods & the classic yellow faces are here\n\n' +
  'Thanks for flapping with us! 🐦';

export function AnnouncementCard() {
  return (
    <View style={styles.card}>
      <LinearGradient colors={[theme.stripTop, theme.stripNavy]} style={styles.strip}>
        <Text style={styles.official}>🐦 TheFlap <Text style={styles.officialSub}>OFFICIAL</Text></Text>
        <View style={styles.badge}><Text style={styles.badgeTxt}>📣 Announcement</Text></View>
      </LinearGradient>
      <LinearGradient colors={[theme.bodyTop, theme.bodyMid, theme.bodyBot]} locations={[0, 0.55, 1]} style={styles.body}>
        <Text style={styles.aTitle}>{ANNOUNCE_TITLE}</Text>
        <Text style={styles.aBody}>{ANNOUNCE_BODY}</Text>
      </LinearGradient>
    </View>
  );
}

// ---- Poll of the Day ------------------------------------------------------
export function PollCard() {
  const { user } = useSession();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [myVote, setMyVoteState] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getDailyPoll();
        setPoll(p);
        if (p) {
          const mv = await getMyVote(p.id);
          setMyVoteState(mv);
          if (mv != null) setResults(await getPollResults(p.id));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const vote = async (i: number) => {
    if (!poll || myVote != null) return;
    setMyVoteState(i);
    await setMyVote(poll.id, i);
    if (user) await votePoll(poll.id, i, user.name);
    setResults(await getPollResults(poll.id));
  };

  if (loading) return <View style={[styles.pcard, { padding: 20 }]}><ActivityIndicator color={theme.orange} /></View>;
  if (!poll) return null;

  const total = results.reduce((a, b) => a + (b || 0), 0) || 0;

  return (
    <View style={styles.pcard}>
      <View style={styles.phead}><Text style={styles.pheadTxt}>🗳️  FLAP POLL OF THE DAY</Text></View>
      <View style={styles.pbody}>
        <Text style={styles.pq}>{poll.question}</Text>
        {poll.opts.map((opt, i) => {
          const c = results[i] || 0;
          const pct = total ? Math.round((c / total) * 100) : 0;
          const voted = myVote != null;
          const mine = myVote === i;
          return (
            <Pressable key={i} style={[styles.opt, mine && styles.optMine]} onPress={() => vote(i)} disabled={voted}>
              {voted && <View style={[styles.bar, { width: (pct + '%') as any }]} />}
              <Text style={styles.optTxt}>{opt}</Text>
              {voted && <Text style={styles.pct}>{pct}%</Text>}
            </Pressable>
          );
        })}
        <Text style={styles.pvotes}>{total} vote{total === 1 ? '' : 's'}{myVote != null ? ' · you voted' : ' · tap to vote'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // announcement
  card: {
    backgroundColor: '#fff', borderWidth: 3, borderColor: theme.cardBorder, borderRadius: 3,
    marginHorizontal: 8, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 6 },
  official: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  officialSub: { color: '#9db0e0', fontSize: 10 },
  badge: { backgroundColor: theme.orange, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  body: { padding: 14 },
  aTitle: { color: theme.navy, fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  aBody: { color: theme.navy, fontSize: 13, lineHeight: 19 },

  // poll
  pcard: {
    backgroundColor: '#fff', borderWidth: 3, borderColor: theme.cardBorder, borderRadius: 3,
    marginHorizontal: 8, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  phead: { backgroundColor: theme.orange, paddingVertical: 6, paddingHorizontal: 10 },
  pheadTxt: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },
  pbody: { padding: 12, backgroundColor: '#eaf4fc' },
  pq: { color: theme.navy, fontWeight: 'bold', fontSize: 15, marginBottom: 10 },
  opt: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: theme.cardBorder, borderRadius: 8,
    paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8, overflow: 'hidden', justifyContent: 'center',
  },
  optMine: { borderColor: theme.orange, borderWidth: 3 },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(47,122,201,0.18)' },
  optTxt: { color: theme.navy, fontSize: 14, fontWeight: '600' },
  pct: { position: 'absolute', right: 12, color: theme.nameNavy, fontWeight: 'bold', fontSize: 13 },
  pvotes: { color: '#5a6b8a', fontSize: 11, marginTop: 2 },
});
