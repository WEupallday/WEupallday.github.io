import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { searchUsers } from '../lib/api';

export default function SearchScreen({ navigation }: any) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async (t: string) => {
    setTerm(t);
    if (t.trim().length < 2) { setResults([]); return; }
    setBusy(true);
    try { setResults(await searchUsers(t)); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search people…"
          placeholderTextColor="#9fb2d8"
          autoCapitalize="none"
          value={term}
          onChangeText={run}
        />
      </View>
      {busy && <ActivityIndicator style={{ marginTop: 16 }} color={theme.orange} />}
      <FlatList
        data={results}
        keyExtractor={(u) => u.name}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Profile', { name: item.name })}>
            <View style={styles.ava}><Text style={styles.avaTxt}>{item.name.slice(0, 2).toUpperCase()}</Text></View>
            <Text style={styles.name}>{item.name}{item.verified ? ' ✓' : ''}{item.premium ? ' ★' : ''}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!busy && term.trim().length >= 2 ? <Text style={styles.empty}>No one found.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.pageBg },
  searchWrap: { padding: 12 },
  search: { backgroundColor: '#1c2a63', color: '#fff', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, borderColor: '#2f7ac9', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  ava: { width: 38, height: 38, borderRadius: 8, backgroundColor: theme.nameNavy, alignItems: 'center', justifyContent: 'center' },
  avaTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600' },
  empty: { color: theme.textDim, textAlign: 'center', marginTop: 24 },
});
