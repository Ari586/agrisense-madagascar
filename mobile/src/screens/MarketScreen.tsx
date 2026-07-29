import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MarketPriceItem } from '../types';

export function MarketScreen() {
  const [items, setItems] = useState<MarketPriceItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch('https://agrisense-madagascar.vercel.app/api/market/prices');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Vidin'ny Tsena (Prix du Marché)</Text>
        <Text style={styles.subtitle}>Données récoltées auprès des tsenas régionaux</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Hitady vokatra (ex: Vary, Vanille, Katsaka)..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Fampidirana ny vidin'ny tsena...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id || item.name}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPrices(); }} colors={['#16a34a']} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isUp = item.trend === 'up';
            const isDown = item.trend === 'down';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.category}>{item.category || 'Vokatry ny tany'}</Text>
                    <Text style={styles.cropName}>{item.name}</Text>
                  </View>

                  <View style={[styles.trendBadge, isUp ? styles.badgeUp : isDown ? styles.badgeDown : styles.badgeStable]}>
                    <Text style={[styles.trendText, isUp ? styles.textUp : isDown ? styles.textDown : styles.textStable]}>
                      {isUp ? '▲ +' : isDown ? '▼ -' : '● '}{item.percentage || 0}%
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.priceLabel}>Vidiny :</Text>
                  <Text style={styles.priceValue}>{item.price?.toLocaleString()} Ar / kg</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 },
  searchInput: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b' },
  list: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  category: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  cropName: { fontSize: 17, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeUp: { backgroundColor: '#dcfce7' },
  badgeDown: { backgroundColor: '#fee2e2' },
  badgeStable: { backgroundColor: '#f1f5f9' },
  trendText: { fontSize: 12, fontWeight: 'bold' },
  textUp: { color: '#15803d' },
  textDown: { color: '#b91c1c' },
  textStable: { color: '#475569' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  priceLabel: { fontSize: 13, color: '#64748b' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
});
