import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DiagnoseResult } from '../types';

export function DiagnoseScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire pour scanner la plante.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0].uri) {
      setSelectedImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès aux photos est nécessaire.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0].uri) {
      setSelectedImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeCrop = () => {
    if (!selectedImage) return;

    setAnalyzing(true);

    // Simulate AI Gemini Analysis connected to server
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        disease: 'Helminthosporiose du Riz (Bipolaris oryzae)',
        confidence: 94,
        severity: 'Modérée',
        description: 'Taches brunes ovales observées sur le limbe des feuilles, typiques des périodes d humidité élevée.',
        treatment: 'Appliquer un fongicide biologique à base de Trichoderma harzianum ou de bouillon bordelais.',
        prevention: 'Assurer un bon drainage de la rizière et éviter le surdosage en engrais azoté.',
      });
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>🤖 Diagnostic IA des Maladies</Text>
        <Text style={styles.subtitle}>
          Prenez une photo nette des feuilles ou des fruits pour identifier immédiatement les parasites ou maladies.
        </Text>
      </View>

      {/* Image Preview Box */}
      <View style={styles.imageBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.cameraIcon}>📸</Text>
            <Text style={styles.placeholderText}>Aucune photo sélectionnée</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={takePhoto}>
          <Text style={styles.btnTextWhite}>📷 Prendre une photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnSecondary} onPress={pickImage}>
          <Text style={styles.btnTextDark}>🖼️ Galerie</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && !result && (
        <TouchableOpacity
          style={[styles.analyzeBtn, analyzing && styles.disabledBtn]}
          onPress={analyzeCrop}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.analyzeBtnText}>⚡ Lancer l'Analyse IA Gemini</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Analysis Results Card */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTag}>Résultat du diagnostic</Text>
              <Text style={styles.diseaseName}>{result.disease}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{result.confidence}% Nivel</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Niveau de sévérité :</Text>
            <Text style={styles.severityVal}>{result.severity}</Text>
          </View>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionHeading}>📖 Description :</Text>
          <Text style={styles.bodyText}>{result.description}</Text>

          <Text style={styles.sectionHeading}>💊 Traitement recommandé :</Text>
          <Text style={styles.bodyText}>{result.treatment}</Text>

          <Text style={styles.sectionHeading}>🛡️ Prévention :</Text>
          <Text style={styles.bodyText}>{result.prevention}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  headerBox: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  imageBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  previewImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { color: '#94a3b8', fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#15803d', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnSecondary: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnTextWhite: { color: '#ffffff', fontWeight: 'bold' },
  btnTextDark: { color: '#0f172a', fontWeight: '600' },
  analyzeBtn: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  disabledBtn: { opacity: 0.7 },
  analyzeBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, elevation: 2 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  resultTag: { fontSize: 11, color: '#16a34a', fontWeight: 'bold', textTransform: 'uppercase' },
  diseaseName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  confidenceBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  confidenceText: { color: '#15803d', fontWeight: 'bold', fontSize: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#64748b', marginRight: 6 },
  severityVal: { fontSize: 13, fontWeight: 'bold', color: '#d97706' },
  sectionDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginTop: 8, marginBottom: 4 },
  bodyText: { fontSize: 13, color: '#475569', lineHeight: 19 },
});
