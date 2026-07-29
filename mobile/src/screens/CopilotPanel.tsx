import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
}

export function CopilotPanel() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'c1',
      sender: 'copilot',
      text: 'Bonjour ! Je suis votre Copilote Agricole IA 🌾. Posez-moi des questions sur les prix du marché, les prévisions d\'exportation ou l\'optimisation de vos récoltes.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskCopilot = () => {
    if (!inputQuery.trim()) return;

    const userMsg: CopilotMessage = { id: Date.now().toString(), sender: 'user', text: inputQuery };
    setMessages((prev) => [...prev, userMsg]);
    const q = inputQuery;
    setInputQuery('');
    setLoading(true);

    // Simulate AI Gemini Response
    setTimeout(() => {
      setLoading(false);
      let reply = 'En analysant les tendances actuelles des marchés à Madagascar, la demande pour la vanille préparée bio et le girofle reste forte sur le marché européen.';
      if (q.toLowerCase().includes('riz') || q.toLowerCase().includes('vary')) {
        reply = 'Le cours du Vary Gasy est actuellement stable à 2800 Ar/kg. La récolte à Ambatondrazaka s annonce très favorable pour ce trimestre.';
      }
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'copilot', text: reply },
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Copilote Agricole & Analytiques</Text>
        <Text style={styles.subtitle}>Intelligence artificielle pour la rentabilité et le commerce</Text>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.msgBubble, m.sender === 'user' ? styles.userBubble : styles.copilotBubble]}
          >
            <Text style={[styles.msgText, m.sender === 'user' ? styles.userText : styles.copilotText]}>
              {m.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#16a34a" />
            <Text style={styles.loadingText}>Analyse Gemini AI en cours...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested prompts */}
      <View style={styles.promptRow}>
        {['📈 Prévision prix Vanille', '🌾 Conseils SRI Riz', '🇪🇺 Normes EUDR'].map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.promptChip}
            onPress={() => { setInputQuery(p); }}
          >
            <Text style={styles.promptChipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Posez une question au Copilote IA..."
          value={inputQuery}
          onChangeText={setInputQuery}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleAskCopilot}>
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  chatArea: { flex: 1, padding: 16 },
  chatContent: { paddingBottom: 20 },
  msgBubble: { padding: 14, borderRadius: 16, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: '#15803d', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  copilotBubble: { backgroundColor: '#ffffff', alignSelf: 'flex-start', borderBottomLeftRadius: 2, elevation: 1 },
  msgText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#ffffff' },
  copilotText: { color: '#0f172a' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  loadingText: { fontSize: 13, color: '#64748b' },
  promptRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  promptChip: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  promptChipText: { fontSize: 11, color: '#15803d', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, marginRight: 8 },
  sendBtn: { backgroundColor: '#15803d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendBtnText: { color: '#ffffff', fontWeight: 'bold' },
});
