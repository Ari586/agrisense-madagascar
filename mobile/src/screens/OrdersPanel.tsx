import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Order, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'escrow_deposited':
        return { label: '🔒 Escrow Déposé (Sécurisé)', bg: '#dcfce7', color: '#15803d' };
      case 'shipped':
        return { label: '🚚 En Transit', bg: '#dbeafe', color: '#1d4ed8' };
      case 'escrow_released':
        return { label: '✅ Paiement Libéré', bg: '#f1f5f9', color: '#475569' };
      case 'pending':
        return { label: '⏳ En Attente de Dépôt', bg: '#fef3c7', color: '#b45309' };
      default:
        return { label: 'Annulé', bg: '#fee2e2', color: '#b91c1c' };
    }
  };

  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          if (o.status === 'escrow_deposited') {
            Alert.alert('Statut mis à jour', 'La commande est maintenant marquée comme Expédiée 🚚');
            return { ...o, status: 'shipped' };
          } else if (o.status === 'shipped') {
            Alert.alert('Escrow Libéré 🎉', 'Le montant de la commande a été débloqué en faveur du vendeur.');
            return { ...o, status: 'escrow_released' };
          }
        }
        return o;
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 Commandes & Escrow Sécurisé</Text>
        <Text style={styles.subtitle}>Gestion des transactions B2B et dépôts de garantie</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>N° Commande : #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <Text style={styles.productTitle}>{item.productTitle}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Acheteur :</Text>
                <Text style={styles.val}>{item.buyerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vendeur :</Text>
                <Text style={styles.val}>{item.sellerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Quantité & Prix :</Text>
                <Text style={styles.val}>{item.quantity} units @ ${item.price}/unit</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Montant Total Escrow :</Text>
                <Text style={styles.totalVal}>${item.totalAmount.toLocaleString()}</Text>
              </View>

              {item.escrowDetails && (
                <View style={styles.escrowBox}>
                  <Text style={styles.escrowText}>🛡️ {item.escrowDetails}</Text>
                </View>
              )}

              {item.status !== 'escrow_released' && item.status !== 'cancelled' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => advanceOrderStatus(item.id)}
                >
                  <Text style={styles.actionBtnText}>
                    {item.status === 'escrow_deposited' ? '🚚 Marquer comme Expédié' : '🔓 Libérer l\'Escrow au Vendeur'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  list: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, color: '#64748b' },
  val: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  totalVal: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
  escrowBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginTop: 10 },
  escrowText: { fontSize: 12, color: '#475569', lineHeight: 17 },
  actionBtn: { backgroundColor: '#15803d', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  actionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
