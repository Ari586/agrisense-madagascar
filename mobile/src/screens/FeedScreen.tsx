import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Post } from '../types';
import { INITIAL_POSTS } from '../data/mockData';

export function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const liked = !p.likedByMe;
          return {
            ...p,
            likedByMe: liked,
            likesCount: liked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', "L'accès aux photos est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un texte pour votre publication.');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      userId: 'user4',
      userName: 'Rakoto Jean',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      userRole: 'farmer',
      caption: newPostText,
      images: selectedImage ? [selectedImage] : [],
      createdAt: 'À l\'instant',
      hashtags: ['#AgriSense', '#Madagascar'],
      likesCount: 0,
      commentsCount: 0,
      savedCount: 0,
      likedByMe: false,
      savedByMe: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setSelectedImage(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Create Post Header Banner */}
      <TouchableOpacity style={styles.createPostBar} onPress={() => setModalVisible(true)}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' }}
          style={styles.avatarImg}
        />
        <Text style={styles.createPostPlaceholder}>Haranosana inona no tianao hozaraina?</Text>
      </TouchableOpacity>

      {/* Social Feed List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {/* Post Author */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.userAvatar }} style={styles.avatarImgBig} />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.userName}</Text>
                <Text style={styles.authorRole}>📍 {item.userRole.toUpperCase()} • {item.createdAt}</Text>
              </View>
            </View>

            {/* Content & Hashtags */}
            <Text style={styles.postContent}>{item.caption}</Text>

            {item.hashtags && item.hashtags.length > 0 && (
              <View style={styles.hashtagRow}>
                {item.hashtags.map((h) => (
                  <Text key={h} style={styles.hashtagText}>{h} </Text>
                ))}
              </View>
            )}

            {/* Attached Photos */}
            {item.images && item.images.length > 0 && (
              <Image source={{ uri: item.images[0] }} style={styles.postImage} resizeMode="cover" />
            )}

            {/* Social Actions (Like, Comment, Share) */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
                <Text style={styles.actionIcon}>{item.likedByMe ? '❤️' : '🤍'}</Text>
                <Text style={[styles.actionText, item.likedByMe && styles.likedText]}>
                  {item.likesCount} Tiako
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>{item.commentsCount} Hevitra</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>↗️</Text>
                <Text style={styles.actionText}>Hozaraina</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for Creating New Post */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hetsika Vaovao (Publication)</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Soraty eto ny zava-nitranga na ny fanontanianao..."
              multiline
              value={newPostText}
              onChangeText={setNewPostText}
            />

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageBadge} onPress={() => setSelectedImage(null)}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
                <Text style={styles.attachButtonText}>🖼️ Sary (Photo)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
                <Text style={styles.submitButtonText}>Hozaraina (Publier)</Text>
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
  createPostBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  avatarImg: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarImgBig: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  createPostPlaceholder: { color: '#64748b', fontSize: 14 },
  listContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  authorRole: { fontSize: 11, color: '#16a34a', fontWeight: 'bold', marginTop: 2 },
  postContent: { fontSize: 15, color: '#1e293b', lineHeight: 22, marginBottom: 8 },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  hashtagText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  postImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12 },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    justifyContent: 'space-around',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { fontSize: 16, marginRight: 6 },
  actionText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  likedText: { color: '#ef4444', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  closeText: { fontSize: 20, color: '#64748b', fontWeight: 'bold' },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 12,
  },
  imagePreviewContainer: { position: 'relative', marginBottom: 12 },
  imagePreview: { width: '100%', height: 150, borderRadius: 12 },
  removeImageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: { color: '#ffffff', fontWeight: 'bold' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attachButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  attachButtonText: { color: '#334155', fontWeight: '600' },
  submitButton: { backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold' },
});
