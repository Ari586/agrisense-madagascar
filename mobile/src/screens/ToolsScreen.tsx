import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const CALENDAR_DATA = [
  { crop: '🌾 Vary (Riz)', plantMonth: 'Novambra - Desambra', harvestMonth: 'Aprily - Mey', tips: 'Impérieux de maintenir le niveau d eau de 5cm pendant la floraison.' },
  { crop: '🌽 Katsaka (Maïs)', plantMonth: 'Okotobra - Novambra', harvestMonth: 'Febroary - Marsa', tips: 'Apporter un engrais riche en azote au 30ème jour.' },
  { crop: '🌱 Voanjo (Arachide)', plantMonth: 'Novambra - Desambra', harvestMonth: 'Marsa - Aprily', tips: 'Préfère les sols sableux bien drainés.' },
  { crop: '🍃 Vanille', plantMonth: 'Saison des pluies', harvestMonth: 'Jolay - Oktobra', tips: 'Mariage manuel (pollinisation) à effectuer tôt le matin.' },
];

export function ToolsScreen() {
  const [activeTool, setActiveTool] = useState<'calendar' | 'irrigation' | 'profit'>('calendar');

  // Irrigation Calculator State
  const [areaSurface, setAreaSurface] = useState('1000'); // m2
  const [cropType, setCropType] = useState('Riz');
  const [waterResult, setWaterResult] = useState<number | null>(5000); // Litres

  // Profit Calculator State
  const [yieldKg, setYieldKg] = useState('2000'); // kg
  const [pricePerKg, setPricePerKg] = useState('2800'); // Ar/kg
  const [costSeed, setCostSeed] = useState('300000'); // Ar
  const [costFertilizer, setCostFertilizer] = useState('500000'); // Ar

  const calculateIrrigation = () => {
    const area = parseFloat(areaSurface) || 0;
    // Base 5 Litres per m2 for rice, 3L for maize
    const rate = cropType === 'Riz' ? 5 : 3;
    setWaterResult(area * rate);
  };

  const calculateProfit = () => {
    const y = parseFloat(yieldKg) || 0;
    const p = parseFloat(pricePerKg) || 0;
    const cSeed = parseFloat(costSeed) || 0;
    const cFert = parseFloat(costFertilizer) || 0;

    const totalRev = y * p;
    const totalCosts = cSeed + cFert;
    const net = totalRev - totalCosts;
    return { totalRev, totalCosts, net };
  };

  const profitStats = calculateProfit();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🧮 Outils & Calculatrices Agricoles</Text>
        <Text style={styles.subtitle}>Tetiandro, Kajy fanondrahana sy Tombony</Text>
      </View>

      {/* Sub Tool Navigation */}
      <View style={styles.toolNav}>
        <TouchableOpacity
          style={[styles.toolNavBtn, activeTool === 'calendar' && styles.toolNavBtnActive]}
          onPress={() => setActiveTool('calendar')}
        >
          <Text style={[styles.toolNavText, activeTool === 'calendar' && styles.toolNavTextActive]}>
            📅 Tetiandro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolNavBtn, activeTool === 'irrigation' && styles.toolNavBtnActive]}
          onPress={() => setActiveTool('irrigation')}
        >
          <Text style={[styles.toolNavText, activeTool === 'irrigation' && styles.toolNavTextActive]}>
            💧 Fanondrahana
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolNavBtn, activeTool === 'profit' && styles.toolNavBtnActive]}
          onPress={() => setActiveTool('profit')}
        >
          <Text style={[styles.toolNavText, activeTool === 'profit' && styles.toolNavTextActive]}>
            💰 Tombony
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Tool */}
      {activeTool === 'calendar' && (
        <View style={styles.toolCard}>
          <Text style={styles.toolTitle}>📅 Tetiandro Fambolena (Calendrier des Semis)</Text>
          <Text style={styles.toolSub}>Périodes recommandées pour planter et récolter à Madagascar</Text>

          {CALENDAR_DATA.map((item) => (
            <View key={item.crop} style={styles.calendarCard}>
              <Text style={styles.cropTitle}>{item.crop}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>🌱 Fambolena (Semis) :</Text>
                <Text style={styles.valGreen}>{item.plantMonth}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>🌾 Fihafiana (Récolte) :</Text>
                <Text style={styles.valOrange}>{item.harvestMonth}</Text>
              </View>
              <Text style={styles.tipText}>💡 {item.tips}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Irrigation Tool */}
      {activeTool === 'irrigation' && (
        <View style={styles.toolCard}>
          <Text style={styles.toolTitle}>💧 Kajy Fanondrahana (Calcul d'eau)</Text>
          <Text style={styles.toolSub}>Estimer le volume d'eau d'irrigation nécessaire</Text>

          <Text style={styles.inputLabel}>Surface du terrain (en m²) :</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={areaSurface}
            onChangeText={(v) => { setAreaSurface(v); calculateIrrigation(); }}
          />

          <View style={styles.cropTypeRow}>
            {['Riz', 'Maïs', 'Légumes'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cropChip, cropType === c && styles.cropChipActive]}
                onPress={() => { setCropType(c); calculateIrrigation(); }}
              >
                <Text style={[styles.cropChipText, cropType === c && styles.cropChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {waterResult !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Besoin d'eau estimé par jour :</Text>
              <Text style={styles.resultValue}>{waterResult.toLocaleString()} Litres</Text>
              <Text style={styles.resultSub}>Soit environ {Math.round(waterResult / 200)} fûts de 200L.</Text>
            </View>
          )}
        </View>
      )}

      {/* Profit Calculator */}
      {activeTool === 'profit' && (
        <View style={styles.toolCard}>
          <Text style={styles.toolTitle}>💰 Kajy Tombony (Rentabilité & Bénéfice)</Text>
          <Text style={styles.toolSub}>Calculer le bénéfice net de votre récolte</Text>

          <Text style={styles.inputLabel}>Récolte estimée (en kg) :</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={yieldKg} onChangeText={setYieldKg} />

          <Text style={styles.inputLabel}>Prix de vente estimé (Ar/kg) :</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={pricePerKg} onChangeText={setPricePerKg} />

          <Text style={styles.inputLabel}>Coût des semences (en Ariary) :</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={costSeed} onChangeText={setCostSeed} />

          <Text style={styles.inputLabel}>Coût des engrais & main d'œuvre (Ar) :</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={costFertilizer} onChangeText={setCostFertilizer} />

          <View style={styles.profitResultBox}>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Recette totale :</Text>
              <Text style={styles.profitValBlue}>{profitStats.totalRev.toLocaleString()} Ar</Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Dépenses totales :</Text>
              <Text style={styles.profitValRed}>-{profitStats.totalCosts.toLocaleString()} Ar</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.profitRow}>
              <Text style={styles.profitLabelBig}>Bénéfice Net :</Text>
              <Text style={[styles.profitValBig, profitStats.net >= 0 ? styles.textGreen : styles.textRed]}>
                {profitStats.net.toLocaleString()} Ar
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  header: { marginBottom: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  toolNav: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 4, borderRadius: 10, marginBottom: 16 },
  toolNavBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toolNavBtnActive: { backgroundColor: '#dcfce7' },
  toolNavText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  toolNavTextActive: { color: '#15803d', fontWeight: 'bold' },
  toolCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, elevation: 1 },
  toolTitle: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  toolSub: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 16 },
  calendarCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10 },
  cropTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, color: '#64748b' },
  valGreen: { fontSize: 13, fontWeight: 'bold', color: '#15803d' },
  valOrange: { fontSize: 13, fontWeight: 'bold', color: '#d97706' },
  tipText: { fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 6 },
  inputLabel: { fontSize: 13, color: '#475569', fontWeight: '600', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  cropTypeRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  cropChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  cropChipActive: { backgroundColor: '#15803d' },
  cropChipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  cropChipTextActive: { color: '#ffffff' },
  resultBox: { backgroundColor: '#dcfce7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  resultLabel: { color: '#15803d', fontSize: 13, fontWeight: '600' },
  resultValue: { color: '#15803d', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  resultSub: { color: '#166534', fontSize: 12 },
  profitResultBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, marginTop: 16 },
  profitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  profitLabel: { fontSize: 13, color: '#64748b' },
  profitValBlue: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  profitValRed: { fontSize: 14, fontWeight: 'bold', color: '#dc2626' },
  divider: { height: 1, backgroundColor: '#cbd5e1', marginVertical: 8 },
  profitLabelBig: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  profitValBig: { fontSize: 20, fontWeight: 'bold' },
  textGreen: { color: '#16a34a' },
  textRed: { color: '#dc2626' },
});
