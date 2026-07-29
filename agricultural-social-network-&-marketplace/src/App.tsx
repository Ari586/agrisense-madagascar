import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Bookmark, Tag, Plus, X, Globe, UserCheck, 
  MapPin, ShieldAlert, ShoppingBag, ShieldCheck, FileText, 
  Video, HelpCircle, TrendingUp, Sparkles, Languages, MessageSquare, ListFilter 
} from 'lucide-react';

import Header from './components/Header';
import FeedPanel from './components/FeedPanel';
import MarketplacePanel from './components/MarketplacePanel';
import OrdersPanel from './components/OrdersPanel';
import ChatPanel from './components/ChatPanel';
import DocumentsPanel from './components/DocumentsPanel';
import ForumPanel from './components/ForumPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import CopilotPanel from './components/CopilotPanel';

import { User, Post, Product, Order, ChatContact } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'marketplace' | 'orders' | 'chat' | 'documents' | 'forum' | 'analytics' | 'copilot'>('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('English');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initial load
  const loadSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
      setAllUsers(data.allUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFeed = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSession();
    loadFeed();
    loadProducts();
    loadOrders();
  }, []);

  // When switching user role, reload data in context
  const handleUserSwitch = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        // Reload context dependent files
        loadOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post interactions
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const updatedPost = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/save`, { method: 'POST' });
      const updatedPost = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      loadFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (postData: { caption: string; images: string[]; hashtags: string[]; taggedProductId?: string }) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Product interactions
  const handleCreateProduct = async (prodData: any) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData)
      });
      const newProd = await res.json();
      setProducts(prev => [newProd, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Orders and Escrow Action triggers
  const handlePlaceOrder = async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      const newOrder = await res.json();
      setOrders(prev => [newOrder, ...prev]);
      // Switch to orders tab to lock/release funds
      setTimeout(() => {
        setActiveTab('orders');
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'deposit' | 'ship' | 'release' | 'cancel') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const updatedOrder = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error(err);
    }
  };

  // Sidebar navigation helpers
  const sidebarItems = [
    { id: 'feed', label: '📱 Social Feed', desc: 'Crop logs & tips' },
    { id: 'marketplace', label: '🛒 Marketplace', desc: 'Direct trade items' },
    { id: 'orders', label: '🛡️ Escrow Orders', desc: 'Secure trade locks' },
    { id: 'chat', label: '💬 Broker Chat', desc: 'Negotiation room' },
    { id: 'documents', label: '📁 Document Hub', desc: 'AI compliance audits' },
    { id: 'forum', label: '🏛️ Forums & Q&A', desc: 'Webinars & expert help' },
    { id: 'analytics', label: '📈 Analytics', desc: 'Market prices & trends' },
    { id: 'copilot', label: '🤖 AI Co-Pilot', desc: 'Smart trade advisor' },
  ];

  const handleNavigateToProduct = (productId: string) => {
    setActiveTab('marketplace');
  };

  const handleNavigateToChat = (contactId: string) => {
    setSelectedContactId(contactId);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-800" id="agrired-root">
      
      {/* Header component */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onUserSwitch={handleUserSwitch}
        language={language}
        onLanguageChange={setLanguage}
        onSearch={setSearchTerm}
      />

      {/* Main layout container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 text-left" id="sidebar-navigation">
          <div className="bg-white border border-gray-100 rounded-2xl p-4.5 space-y-2 sticky top-[80px]">
            <span className="text-[10px] font-black uppercase text-gray-400 font-mono tracking-wider px-2">
              Navigation Workspace
            </span>
            <nav className="flex flex-col gap-1.5 pt-2">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex flex-col ${
                      isActive
                        ? 'bg-red-500 text-white font-extrabold shadow-md shadow-red-100'
                        : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-red-500 border border-transparent hover:border-gray-100'
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">{item.label}</span>
                    <span className={`text-[9px] mt-1 font-medium ${isActive ? 'text-red-100' : 'text-gray-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </nav>
            
            {/* Quick system status */}
            <div className="pt-4 mt-4 border-t border-gray-50/80 text-[10px] text-gray-400 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span>Database Sync:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Status:</span>
                <span className="font-bold text-emerald-500">SECURE_SSL</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Interactive Panel viewport */}
        <section className="flex-1 min-w-0" id="viewport-panel">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs h-full min-h-[500px] flex flex-col justify-between">
            {/* Conditional view rendering */}
            {activeTab === 'feed' && (
              <FeedPanel
                posts={posts}
                products={products}
                onLike={handleLike}
                onSave={handleSave}
                onAddComment={handleAddComment}
                onCreatePost={handleCreatePost}
                onNavigateToProduct={handleNavigateToProduct}
                language={language}
              />
            )}

            {activeTab === 'marketplace' && (
              <MarketplacePanel
                products={products}
                onCreateProduct={handleCreateProduct}
                onPlaceOrder={handlePlaceOrder}
                onNavigateToChat={handleNavigateToChat}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersPanel
                orders={orders}
                currentUser={currentUser}
                onOrderAction={handleOrderAction}
              />
            )}

            {activeTab === 'chat' && (
              <ChatPanel
                currentUser={currentUser}
                selectedContactId={selectedContactId}
                onSelectContact={setSelectedContactId}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsPanel
                currentUser={currentUser}
              />
            )}

            {activeTab === 'forum' && (
              <ForumPanel
                currentUser={currentUser}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPanel />
            )}

            {activeTab === 'copilot' && (
              <CopilotPanel
                language={language}
              />
            )}

            {/* General professional footer inside the card viewport */}
            <footer className="mt-8 pt-5 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-[10px] font-mono leading-none">
              <span>© 2026 AgriRED. All rights reserved.</span>
              <div className="flex gap-4">
                <a href="#privacy" className="hover:text-red-500">Privacy</a>
                <a href="#terms" className="hover:text-red-500">Trading Terms</a>
                <a href="#docs" className="hover:text-red-500">Phytosanitary Guides</a>
              </div>
            </footer>
          </div>
        </section>

      </main>
    </div>
  );
}
