import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Message, ChatContact } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

const CONTACTS: ChatContact[] = [
  {
    id: 'user1',
    name: 'Juan Valdez',
    role: 'farmer',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    lastMessage: 'Is the 20MT Arabica lot available for export?',
    lastMessageTime: '10:30 AM',
  },
  {
    id: 'user2',
    name: 'Sarah Jenkins',
    role: 'trader',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    lastMessage: 'I accept your counter-proposal for the vanilla lot.',
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'user4',
    name: 'Rakoto Jean',
    role: 'farmer',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    lastMessage: 'Manahoana, afaka mandefa vary 500kg ho anay ve ianao?',
    lastMessageTime: '2 days ago',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'user2',
    receiverId: 'user1',
    content: 'Hello Juan, we are interested in purchasing 5 MT of your specialty washed Arabica coffee.',
    createdAt: '10:15 AM',
    type: 'text',
  },
  {
    id: 'm2',
    senderId: 'user1',
    receiverId: 'user2',
    content: 'Greetings Sarah! The lot is ready. I can offer $4.20/kg FOB Cartagena.',
    createdAt: '10:20 AM',
    type: 'text',
  },
  {
    id: 'm3',
    senderId: 'user2',
    receiverId: 'user1',
    content: 'Offre de négociation de prix proposée :',
    createdAt: '10:30 AM',
    type: 'negotiation',
    proposalPrice: 4.00,
    proposalQuantity: 5000,
    proposalStatus: 'pending',
  },
];

export function ChatPanel() {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(CONTACTS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'currentUser',
      receiverId: selectedContact?.id || 'user1',
      content: inputText,
      createdAt: 'À l\'instant',
      type: 'text',
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const handleProposalAction = (messageId: string, action: 'accepted' | 'declined') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          return { ...m, proposalStatus: action };
        }
        return m;
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Contact Selector */}
      <View style={styles.contactBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CONTACTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.contactChip, selectedContact?.id === item.id && styles.contactChipActive]}
              onPress={() => setSelectedContact(item)}
            >
              <Image source={{ uri: item.profilePicture }} style={styles.chipAvatar} />
              <View>
                <Text style={[styles.chipName, selectedContact?.id === item.id && styles.chipNameActive]}>
                  {item.name}
                </Text>
                <Text style={styles.chipRole}>{item.role}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Messages Feed */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'currentUser';
          return (
            <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
              {item.type === 'text' ? (
                <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.msgText, isMe ? styles.textWhite : styles.textDark]}>{item.content}</Text>
                  <Text style={[styles.msgTime, isMe ? styles.timeWhite : styles.timeDark]}>{item.createdAt}</Text>
                </View>
              ) : (
                /* Negotiation Proposal Card */
                <View style={styles.proposalCard}>
                  <Text style={styles.proposalTitle}>🏷️ Offre de Négociation Directe</Text>
                  <Text style={styles.proposalDetail}>Quantité : {item.proposalQuantity?.toLocaleString()} units</Text>
                  <Text style={styles.proposalPrice}>Prix Proposé : ${item.proposalPrice} / unit</Text>

                  {item.proposalStatus === 'pending' ? (
                    <View style={styles.proposalActions}>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleProposalAction(item.id, 'declined')}
                      >
                        <Text style={styles.declineText}>Refuser</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleProposalAction(item.id, 'accepted')}
                      >
                        <Text style={styles.acceptText}>Accepter l'Offre</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.statusBox}>
                      <Text style={item.proposalStatus === 'accepted' ? styles.acceptedText : styles.declinedText}>
                        {item.proposalStatus === 'accepted' ? '✅ Offre Acceptée' : '❌ Offre Refusée'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder={`Message à ${selectedContact?.name || 'Contact'}...`}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contactBar: { backgroundColor: '#ffffff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  contactChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 10 },
  contactChipActive: { backgroundColor: '#15803d' },
  chipAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  chipName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  chipNameActive: { color: '#ffffff' },
  chipRole: { fontSize: 10, color: '#64748b', textTransform: 'capitalize' },
  messageList: { padding: 16 },
  msgWrapper: { marginBottom: 12, maxWidth: '80%' },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  msgBubble: { padding: 12, borderRadius: 16 },
  bubbleMe: { backgroundColor: '#15803d', borderBottomRightRadius: 2 },
  bubbleOther: { backgroundColor: '#ffffff', borderBottomLeftRadius: 2, elevation: 1 },
  msgText: { fontSize: 14, lineHeight: 20 },
  textWhite: { color: '#ffffff' },
  textDark: { color: '#0f172a' },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  timeWhite: { color: '#bbf7d0' },
  timeDark: { color: '#94a3b8' },
  proposalCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 14, elevation: 2, borderWidth: 1, borderColor: '#cbd5e1' },
  proposalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  proposalDetail: { fontSize: 13, color: '#475569' },
  proposalPrice: { fontSize: 16, fontWeight: 'bold', color: '#16a34a', marginVertical: 4 },
  proposalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  declineBtn: { flex: 1, backgroundColor: '#fee2e2', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  declineText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#16a34a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  acceptText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  statusBox: { marginTop: 8, alignItems: 'center' },
  acceptedText: { color: '#15803d', fontWeight: 'bold' },
  declinedText: { color: '#b91c1c', fontWeight: 'bold' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, marginRight: 8 },
  sendBtn: { backgroundColor: '#15803d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendBtnText: { color: '#ffffff', fontWeight: 'bold' },
});
