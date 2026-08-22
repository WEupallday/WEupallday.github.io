import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../theme';
import { getFeathers, getOwnedItems } from '../lib/api';
import { useSession } from '../state/session';

export default function StoreScreen() {
  const { user } = useSession();
  const [feathers, setFeathers] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, o] = await Promise.all([getFeathers(user!.name), getOwnedItems(user!.name)]);
        setFeathers(f); setOwned(o);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user]);

  // Apple compliance: NEVER show any purchase / external-checkout UI on iOS.
  const showBuy = Platform.OS !== 'ios';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.h}>Store</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={theme.orange} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14 }}>
          <View style={styles.balance}>
            <Text style={styles.bLabel}>Your Feathers</Text>
            <Text style={styles.bValue}>🪶 {feathers.toLocaleString()}</Text>
          </View>

          <Text style={styles.section}>Your items</Text>
          {owned.length === 0 ? (
            <Text style={styles.empty}>No items yet. Earn Feathers to unlock cosmetics.</Text>
          ) : (
            <View style={styles.grid}>
              {owned.map((it) => (
                <View key={it} style={styles.item}><Text style={styles.itemTxt}>{it}</Text></View>
              ))}
            </View>
          )}

          {showBuy && (
            <View style={styles.buyBox}>
              <Text style={styles.buyTxt}>Feather packs and Premium are available on the web and Android.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  h: { color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 14 },
  balance: { backgroundColor: '#1c2a63', borderRadius: radius.md, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#2f7ac9' },
  bLabel: { color: theme.textDim, fontSize: 13 },
  bValue: { color: theme.orange, fontSize: 30, fontWeight: 'bold', marginTop: 4 },
  section: { color: theme.textDim, fontSize: 12, textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { backgroundColor: '#eaf4fc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  itemTxt: { color: theme.navy, fontWeight: '600', fontSize: 13 },
  empty: { color: theme.textDim, fontSize: 13 },
  buyBox: { marginTop: 22, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: radius.md, padding: 14 },
  buyTxt: { color: theme.textDim, fontSize: 13, lineHeight: 19 },
});
