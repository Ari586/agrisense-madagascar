import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

const REGIONS = ['Antananarivo', 'Antsirabe', 'Ambatondrazaka', 'Toamasina', 'Fianarantsoa', 'Mahajanga'];

export function WeatherScreen() {
  const [selectedRegion, setSelectedRegion] = useState('Antananarivo');
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);

  const requestGpsLocation = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission GPS refusée.');
        setLoadingGps(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setGpsLocation(`GPS: ${location.coords.latitude.toFixed(2)}°, ${location.coords.longitude.toFixed(2)}°`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGps(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>☀️ Météo & Climat Agricole</Text>
        <Text style={styles.subtitle}>Prévisions météorologiques et alertes d'irrigation</Text>
      </View>

      {/* Region selector chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {REGIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, selectedRegion === r && styles.chipActive]}
            onPress={() => setSelectedRegion(r)}
          >
            <Text style={[styles.chipText, selectedRegion === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* GPS Button */}
      <TouchableOpacity style={styles.gpsBtn} onPress={requestGpsLocation}>
        {loadingGps ? (
          <ActivityIndicator color="#15803d" />
        ) : (
          <Text style={styles.gpsBtnText}>
            📍 {gpsLocation ? gpsLocation : 'Utiliser ma position GPS exacte'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Main Weather Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.locationText}>📍 {selectedRegion}, Madagascar</Text>
            <Text style={styles.dateText}>Aujourd'hui, 22 Juillet</Text>
          </View>
          <Text style={styles.weatherEmoji}>☀️</Text>
        </View>

        <Text style={styles.tempText}>26°C</Text>
        <Text style={styles.weatherCondition}>Ensoleillé avec quelques nuages</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>💧 Humidité Sol</Text>
            <Text style={styles.metricValue}>64%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>🌧️ Pluie (24h)</Text>
            <Text style={styles.metricValue}>5 mm</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>💨 Vent</Text>
            <Text style={styles.metricValue}>12 km/h</Text>
          </View>
        </View>
      </View>

      {/* Agricultural Advice Card */}
      <View style={styles.adviceCard}>
        <Text style={styles.adviceHeading}>💡 Conseil d'Irrigation du Jour</Text>
        <Text style={styles.adviceBody}>
          Conditions idéales pour le repiquage du riz dans la région de {selectedRegion}. Les précipitations modérées prévues demain réduisent les besoins d'arrosage manuel.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  header: { marginBottom: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  chipScroll: { marginBottom: 12 },
  chip: { backgroundColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#15803d' },
  chipText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#ffffff' },
  gpsBtn: { backgroundColor: '#dcfce7', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  gpsBtnText: { color: '#15803d', fontWeight: '700', fontSize: 13 },
  heroCard: { backgroundColor: '#15803d', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locationText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  dateText: { color: '#bbf7d0', fontSize: 12, marginTop: 2 },
  weatherEmoji: { fontSize: 36 },
  tempText: { color: '#ffffff', fontSize: 44, fontWeight: 'bold', marginVertical: 6 },
  weatherCondition: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  metricsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14, marginTop: 14 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: { color: '#bbf7d0', fontSize: 11 },
  metricValue: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  adviceCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, elevation: 1 },
  adviceHeading: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  adviceBody: { fontSize: 13, color: '#475569', lineHeight: 19 },
});
