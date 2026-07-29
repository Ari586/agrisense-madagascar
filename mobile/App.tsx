import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { FeedScreen } from './src/screens/FeedScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { OrdersPanel } from './src/screens/OrdersPanel';
import { ForumPanel } from './src/screens/ForumPanel';
import { ChatPanel } from './src/screens/ChatPanel';
import { CopilotPanel } from './src/screens/CopilotPanel';
import { DiagnoseScreen } from './src/screens/DiagnoseScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';

type ActiveTab = 'feed' | 'marketplace' | 'orders' | 'forum' | 'chat' | 'copilot' | 'diagnose' | 'weather';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Main Top Header */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.appTitle}>Agricultural Social Network & Marketplace</Text>
          <Text style={styles.appSubtitle}>Platforme Mondiale & Madagascar B2B Trade</Text>
        </View>
        <View style={styles.nativeBadge}>
          <Text style={styles.nativeBadgeText}>REACT NATIVE</Text>
        </View>
      </View>

      {/* Scrollable Sub Header Bar */}
      <View style={styles.topTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'feed' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.topTabText, activeTab === 'feed' && styles.topTabTextActive]}>📰 Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'marketplace' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('marketplace')}
          >
            <Text style={[styles.topTabText, activeTab === 'marketplace' && styles.topTabTextActive]}>🛒 Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'orders' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.topTabText, activeTab === 'orders' && styles.topTabTextActive]}>📦 Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'forum' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('forum')}
          >
            <Text style={[styles.topTabText, activeTab === 'forum' && styles.topTabTextActive]}>💬 Forum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'chat' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text style={[styles.topTabText, activeTab === 'chat' && styles.topTabTextActive]}>✉️ Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'copilot' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('copilot')}
          >
            <Text style={[styles.topTabText, activeTab === 'copilot' && styles.topTabTextActive]}>🤖 AI Copilot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'diagnose' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('diagnose')}
          >
            <Text style={[styles.topTabText, activeTab === 'diagnose' && styles.topTabTextActive]}>📸 Scan IA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'weather' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('weather')}
          >
            <Text style={[styles.topTabText, activeTab === 'weather' && styles.topTabTextActive]}>☀️ Météo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Active Screen Area */}
      <View style={styles.screenContainer}>
        {activeTab === 'feed' && <FeedScreen />}
        {activeTab === 'marketplace' && <MarketplaceScreen />}
        {activeTab === 'orders' && <OrdersPanel />}
        {activeTab === 'forum' && <ForumPanel />}
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'copilot' && <CopilotPanel />}
        {activeTab === 'diagnose' && <DiagnoseScreen />}
        {activeTab === 'weather' && <WeatherScreen />}
      </View>

      {/* Quick Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'feed' && styles.bottomTabActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={styles.tabIcon}>📰</Text>
          <Text style={[styles.tabLabel, activeTab === 'feed' && styles.tabLabelActive]}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'marketplace' && styles.bottomTabActive]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text style={styles.tabIcon}>🛒</Text>
          <Text style={[styles.tabLabel, activeTab === 'marketplace' && styles.tabLabelActive]}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'orders' && styles.bottomTabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'chat' && styles.bottomTabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={styles.tabIcon}>✉️</Text>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'copilot' && styles.bottomTabActive]}
          onPress={() => setActiveTab('copilot')}
        >
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={[styles.tabLabel, activeTab === 'copilot' && styles.tabLabelActive]}>Copilot</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#15803d',
  },
  appHeader: {
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appSubtitle: {
    color: '#bbf7d0',
    fontSize: 10,
    fontWeight: '500',
  },
  nativeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nativeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  topTabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
  },
  topTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#f1f5f9',
  },
  topTabBtnActive: {
    backgroundColor: '#15803d',
  },
  topTabText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  topTabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 6,
    paddingBottom: 8,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabActive: {},
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#15803d',
    fontWeight: 'bold',
  },
});
