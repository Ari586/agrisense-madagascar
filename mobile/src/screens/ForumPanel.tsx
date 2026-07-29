import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { ForumThread } from '../types';
import { INITIAL_THREADS } from '../data/mockData';

export function ForumPanel() {
  const [threads, setThreads] = useState<ForumThread[]>(INITIAL_THREADS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('#Vanille');

  const handleCreateThread = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le contenu de la discussion.');
      return;
    }

    const thread: ForumThread = {
      id: Date.now().toString(),
      userId: 'user4',
      userName: 'Mpanjifa (Vous)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      title: newTitle,
      content: newContent,
      tags: [selectedTag],
      createdAt: 'À l\'instant',
      repliesCount: 0,
    };

    setThreads([thread, ...threads]);
    setModalVisible(false);
    setNewTitle('');
    setNewContent('');
    Alert.alert('Succès 🎉', 'Votre sujet de discussion a été publié sur le Forum !');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>💬 Forum & Fiaraha-monina</Text>
            <Text style={styles.subtitle}>Discussions, questions-réponses et réglementations</Text>
          </View>
          <TouchableOpacity style={styles.newThreadBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.newThreadBtnText}>+ Hanomboka</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.tagRow}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              <Text style={styles.dateText}>{item.createdAt}</Text>
            </View>

            <Text style={styles.threadTitle}>{item.title}</Text>
            <Text style={styles.threadContent}>{item.content}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.authorText}>Par {item.userName}</Text>

              <TouchableOpacity style={styles.replyBadge}>
                <Text style={styles.replyText}>💬 {item.repliesCount} Réponses</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal Add Thread */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sujet de Discussion Vaovao</Text>

            <TextInput
              placeholder="Titre du sujet (ex: Prix du Girofle à Tamatave)"
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              placeholder="Posez votre question ou détaillez le problème..."
              style={[styles.input, styles.multilineInput]}
              multiline
              value={newContent}
              onChangeText={setNewContent}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateThread}>
                <Text style={styles.submitText}>Publier</Text>
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
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  newThreadBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newThreadBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  list: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tagChip: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 6 },
  tagText: { fontSize: 11, color: '#15803d', fontWeight: 'bold' },
  dateText: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto' },
  threadTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  threadContent: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  authorText: { fontSize: 12, color: '#64748b' },
  replyBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  replyText: { fontSize: 12, color: '#1e293b', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 14 },
  input: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 10, marginBottom: 12, borderRadius: 6 },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { color: '#64748b', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  submitText: { color: '#ffffff', fontWeight: 'bold' },
});
