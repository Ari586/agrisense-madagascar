import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, MarketPriceItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

export function MarketplaceScreen() {
  const [subTab, setSubTab] = useState<'listings' | 'prices'>('listings');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Modal Add Product State
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [moqStr, setMoqStr] = useState('10');
  const [location, setLocation] = useState('Antananarivo, Madagascar');
  const [productImage, setProductImage] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch('https://agrisense-madagascar.vercel.app/api/market/prices');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPrices(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrices(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la galerie photo est requis.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0].uri) {
      setProductImage(res.assets[0].uri);
    }
  };

  const handleAddProduct = () => {
    if (!title || !priceStr) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le prix.');
      return;
    }

    const newProd: Product = {
      id: Date.now().toString(),
      userId: 'user4',
      userName: 'Rakoto Jean',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      userRole: 'farmer',
      userRating: 4.9,
      title,
      description: 'Produit agricole de première qualité disponible immédiatement.',
      price: parseFloat(priceStr) || 0,
      unit: 'kg',
      category: 'crops',
      images: [productImage || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'],
      isAvailable: true,
      moq: parseInt(moqStr) || 1,
      location,
      certification: ['AgriSense Verified'],
      urgency: 'medium',
    };

    setProducts([newProd, ...products]);
    setModalVisible(false);
    setTitle('');
    setPriceStr('');
    setProductImage(null);
    Alert.alert('Succès 🎉', 'Votre annonce a été publiée sur le Marché B2B !');
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Tous' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      {/* Sub Header Segmented Navigation */}
      <View style={styles.segmentedBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, subTab === 'listings' && styles.segmentBtnActive]}
          onPress={() => setSubTab('listings')}
        >
          <Text style={[styles.segmentText, subTab === 'listings' && styles.segmentTextActive]}>
            🛒 Offres B2B ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, subTab === 'prices' && styles.segmentBtnActive]}
          onPress={() => setSubTab('prices')}
        >
          <Text style={[styles.segmentText, subTab === 'prices' && styles.segmentTextActive]}>
            📈 Cours des Prix API
          </Text>
        </TouchableOpacity>
      </View>

      {subTab === 'listings' ? (
        <View style={styles.flex1}>
          {/* Header Action & Search */}
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.sellButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.sellButtonText}>➕ Publier une Annonce Produit / Machine</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Tadiavo ny vokatra (ex: Coffee, Vanille, Solar)..."
              value={search}
              onChangeText={setSearch}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['Tous', 'Crops', 'Machinery', 'Services'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Product Cards List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                <View style={styles.productBody}>
                  <View style={styles.productBadgeRow}>
                    <Text style={styles.regionBadge}>📍 {item.location}</Text>
                    <Text style={styles.categoryBadge}>MOQ: {item.moq} {item.unit}</Text>
                  </View>

                  <Text style={styles.productTitle}>{item.title}</Text>
                  <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>

                  {item.certification && item.certification.length > 0 && (
                    <View style={styles.certRow}>
                      {item.certification.map((c) => (
                        <Text key={c} style={styles.certBadge}>✓ {c} </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price} / {item.unit}</Text>
                    <Text style={styles.sellerName}>Par {item.userName} ★ {item.userRating}</Text>
                  </View>

                  <TouchableOpacity style={styles.orderButton}>
                    <Text style={styles.orderButtonText}>🛒 Commander en Escrow Sécurisé</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      ) : (
        /* Market Prices Section */
        <View style={styles.flex1}>
          {loadingPrices ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text style={styles.loadingText}>Fampidirana ny vidin'ny tsena...</Text>
            </View>
          ) : (
            <FlatList
              data={prices}
              keyExtractor={(item) => item.id || item.name}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPrices(); }} colors={['#16a34a']} />}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => {
                const isUp = item.trend === 'up';
                const isDown = item.trend === 'down';
                return (
                  <View style={styles.priceCard}>
                    <View style={styles.priceCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.categorySmall}>{item.category || 'Vokatry ny tany'}</Text>
                        <Text style={styles.cropTitle}>{item.name}</Text>
                      </View>
                      <View style={[styles.trendPill, isUp ? styles.pillUp : isDown ? styles.pillDown : styles.pillStable]}>
                        <Text style={[styles.trendPillText, isUp ? styles.pillTextUp : isDown ? styles.pillTextDown : styles.pillTextStable]}>
                          {isUp ? '▲ +' : isDown ? '▼ -' : '● '}{item.percentage || 0}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.priceFooter}>
                      <Text style={styles.priceLabel}>Vidiny eo amin'ny tsena :</Text>
                      <Text style={styles.priceBig}>{item.price?.toLocaleString()} Ar / kg</Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Modal Add Product */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Publier une Annonce Produit / Machine</Text>

            <TextInput placeholder="Titre (ex: Specialty Arabica Coffee)" style={styles.input} value={title} onChangeText={setTitle} />
            <TextInput placeholder="Prix par unité ($USD ou Ar)" keyboardType="numeric" style={styles.input} value={priceStr} onChangeText={setPriceStr} />
            <TextInput placeholder="Quantité Minimum (MOQ)" keyboardType="numeric" style={styles.input} value={moqStr} onChangeText={setMoqStr} />
            <TextInput placeholder="Localisation (ex: Sambava, Madagascar)" style={styles.input} value={location} onChangeText={setLocation} />

            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Text style={styles.imagePickerBtnText}>
                {productImage ? '✅ Photo Sélectionnée' : '📸 Ajouter une photo du produit'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                <Text style={styles.submitBtnText}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  flex1: { flex: 1 },
  segmentedBar: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 6 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#dcfce7' },
  segmentText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#15803d', fontWeight: 'bold' },
  topSection: { padding: 12, backgroundColor: '#ffffff' },
  sellButton: { backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  sellButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  searchInput: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  filterChipActive: { backgroundColor: '#15803d' },
  filterChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  filterChipTextActive: { color: '#ffffff' },
  listPadding: { padding: 12 },
  productCard: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, elevation: 2 },
  productImage: { width: '100%', height: 170 },
  productBody: { padding: 14 },
  productBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  regionBadge: { fontSize: 11, color: '#16a34a', fontWeight: 'bold' },
  categoryBadge: { fontSize: 11, color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  productDesc: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  certRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  certBadge: { fontSize: 10, color: '#15803d', fontWeight: 'bold', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#15803d' },
  sellerName: { fontSize: 12, color: '#64748b' },
  orderButton: { backgroundColor: '#15803d', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  orderButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: '#64748b', marginTop: 10 },
  priceCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 14, marginBottom: 10, elevation: 1 },
  priceCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  categorySmall: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  cropTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  trendPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pillUp: { backgroundColor: '#dcfce7' },
  pillDown: { backgroundColor: '#fee2e2' },
  pillStable: { backgroundColor: '#f1f5f9' },
  trendPillText: { fontSize: 12, fontWeight: 'bold' },
  pillTextUp: { color: '#15803d' },
  pillTextDown: { color: '#b91c1c' },
  pillTextStable: { color: '#475569' },
  priceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  priceLabel: { fontSize: 13, color: '#64748b' },
  priceBig: { fontSize: 17, fontWeight: 'bold', color: '#16a34a' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 10, marginBottom: 12, borderRadius: 6 },
  imagePickerBtn: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  imagePickerBtnText: { color: '#0f172a', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold' },
});
