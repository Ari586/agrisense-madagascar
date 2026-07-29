import React, { useState } from 'react';
import { 
  Tag, Filter, Plus, X, ShieldAlert, BadgePercent, MapPin, 
  ChevronRight, ShoppingCart, ShoppingBag, Check, ListFilter, AlertTriangle 
} from 'lucide-react';
import { Product } from '../types';

interface MarketplacePanelProps {
  products: Product[];
  onCreateProduct: (prodData: any) => Promise<void>;
  onPlaceOrder: (productId: string, quantity: number) => Promise<void>;
  onNavigateToChat: (contactId: string) => void;
}

export default function MarketplacePanel({
  products,
  onCreateProduct,
  onPlaceOrder,
  onNavigateToChat
}: MarketplacePanelProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'crops' | 'machinery' | 'services'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCertification, setSelectedCertification] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  
  const [isListing, setIsListing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState<'crops' | 'machinery' | 'services'>('crops');
  const [moq, setMoq] = useState('');
  const [location, setLocation] = useState('');
  const [certificationsText, setCertificationsText] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low');
  const [imageUrl, setImageUrl] = useState('');

  // Quick order state
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  // Get distinct locations and certifications for filters
  const locations = Array.from(new Set(products.map(p => p.location)));
  const certifications = Array.from(new Set(products.flatMap(p => p.certification)));

  // Filter products
  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedLocation !== 'all' && p.location !== selectedLocation) return false;
    if (selectedCertification !== 'all' && !p.certification.includes(selectedCertification)) return false;
    if (selectedUrgency !== 'all' && p.urgency !== selectedUrgency) return false;
    return true;
  });

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !moq) return;

    await onCreateProduct({
      title,
      description,
      price: Number(price),
      unit,
      category,
      moq: Number(moq),
      location,
      certification: certificationsText.split(',').map(c => c.trim()).filter(Boolean),
      urgency,
      images: imageUrl ? [imageUrl] : undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPrice('');
    setUnit('kg');
    setCategory('crops');
    setMoq('');
    setLocation('');
    setCertificationsText('');
    setUrgency('low');
    setImageUrl('');
    setIsListing(false);
  };

  const startOrdering = (prod: Product) => {
    setOrderingProduct(prod);
    setOrderQuantity(prod.moq); // Start with MOQ
    setOrderPlacedSuccess(false);
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    await onPlaceOrder(orderingProduct.id, orderQuantity);
    setOrderPlacedSuccess(true);
    setTimeout(() => {
      setOrderingProduct(null);
      setOrderPlacedSuccess(false);
    }, 2000);
  };

  return (
    <div className="w-full" id="marketplace-panel">
      
      {/* Marketplace Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
            🛒 Trade Marketplace
          </h2>
          <p className="text-xs text-gray-500">Buy & Sell direct wholesale crops, heavy farm machinery, or logistics services</p>
        </div>
        <button
          onClick={() => setIsListing(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-xs font-bold text-white shadow-md shadow-red-100 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Listing</span>
        </button>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-100 pb-3">
        {[
          { id: 'all', label: 'All Products', icon: ShoppingBag },
          { id: 'crops', label: 'Crops & Commodities', icon: Tag },
          { id: 'machinery', label: 'Farm Machinery', icon: BadgePercent },
          { id: 'services', label: 'Agri-Services & Freight', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                activeCategory === tab.id
                  ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100'
                  : 'bg-white border-gray-150 text-gray-600 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Rail */}
      <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5 text-xs font-black text-gray-700 uppercase tracking-wider font-mono mr-2">
          <ListFilter className="w-4 h-4 text-red-500" />
          <span>Filters:</span>
        </div>

        {/* Location Filter */}
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 mb-1">Region/Origin</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Certification Filter */}
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 mb-1">Certifications</span>
          <select
            value={selectedCertification}
            onChange={(e) => setSelectedCertification(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-hidden"
          >
            <option value="all">All Certs</option>
            {certifications.map(cert => (
              <option key={cert} value={cert}>{cert}</option>
            ))}
          </select>
        </div>

        {/* Perishability Urgency Filter */}
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 mb-1">Perishability Urgency</span>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-hidden"
          >
            <option value="all">Any Urgency</option>
            <option value="high">🔥 High Urgency</option>
            <option value="medium">⚡ Medium Urgency</option>
            <option value="low">💤 Stable / Low</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="flex-1 min-w-[150px] flex flex-col text-left">
          <span className="text-[9px] font-extrabold uppercase font-mono text-gray-400 mb-1">Keyword Query</span>
          <input
            type="text"
            placeholder="Type keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-hidden focus:border-red-300"
          />
        </div>
      </div>

      {/* Grid of Listings */}
      {filteredProducts.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No active trade listings found</h4>
          <p className="text-xs text-gray-500 mt-1">Try widening your filters or post a new listing yourself!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full text-left"
            >
              {/* Product Card Image */}
              <div className="relative aspect-video bg-gray-50 overflow-hidden">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Urgency Badge */}
                {prod.urgency === 'high' && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-red-600/95 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md">
                    <span>🔥 Highly Urgent Sell</span>
                  </span>
                )}
                {prod.urgency === 'medium' && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500/90 text-white font-extrabold text-[9px] uppercase tracking-wider">
                    <span>⚡ Fresh crop</span>
                  </span>
                )}

                <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md font-bold text-xs text-white">
                  ${prod.price} <span className="text-[10px] text-gray-300 font-normal">/ {prod.unit}</span>
                </span>
              </div>

              {/* Product Body */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2">
                    {prod.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                  {prod.description}
                </p>

                {/* Seller snippet & location */}
                <div className="mt-auto space-y-3.5 pt-3.5 border-t border-gray-50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{prod.location}</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-600 bg-gray-100 rounded-sm px-2 py-0.5">
                      MOQ: {prod.moq} {prod.unit}
                    </span>
                  </div>

                  {/* Certifications list */}
                  {prod.certification.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prod.certification.map(c => (
                        <span key={c} className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-sm">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Seller avatar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={prod.userAvatar} alt={prod.userName} className="w-6.5 h-6.5 rounded-full object-cover" />
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-gray-800 leading-tight">{prod.userName}</span>
                        <span className="text-[8px] font-bold text-gray-400 font-mono tracking-wider uppercase">{prod.userRole} · {prod.userRating}★</span>
                      </div>
                    </div>

                    {/* Actions: order or negotiate */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onNavigateToChat(prod.userId)}
                        className="px-2.5 py-1.5 border border-gray-200 hover:border-red-400 text-gray-600 hover:text-red-500 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Negotiate
                      </button>
                      <button
                        onClick={() => startOrdering(prod)}
                        className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- CREATE LISTING DIALOG ----------------- */}
      {isListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono">
                📢 Publish Trade Listing
              </h3>
              <button onClick={() => setIsListing(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-5 space-y-4 text-left">
              {/* Category selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'crops', label: '🌾 Crop Lot' },
                  { id: 'machinery', label: '⚙️ Machinery' },
                  { id: 'services', label: '🚚 Logistics' }
                ].map((catOpt) => (
                  <button
                    key={catOpt.id}
                    type="button"
                    onClick={() => setCategory(catOpt.id as any)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      category === catOpt.id
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {catOpt.label}
                  </button>
                ))}
              </div>

              {/* Title & Desc */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Listing Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bulk Organic Robusta Grains"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Description:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details such as grade, drying parameters, packaging type..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-red-500 resize-none"
                  />
                </div>
              </div>

              {/* Price, Unit, MOQ */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Price (USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="6.50"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Unit:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, ton, unit"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Min Order Qty:</label>
                  <input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    placeholder="500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Location & Certs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">FOB Location:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Medellín, Colombia"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Certs (comma separated):</label>
                  <input
                    type="text"
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    placeholder="e.g. Organic, Fair Trade"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Urgency & Image */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Urgency Level:</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-750 focus:outline-hidden"
                  >
                    <option value="low">Low (Stable shelf-life)</option>
                    <option value="medium">Medium (Fresh batch)</option>
                    <option value="high">High (Perishable cargo alert)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Image URL:</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsListing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md shadow-red-100 transition-colors"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- BUY NOW / LAUNCH ORDER DIALOG ----------------- */}
      {orderingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono text-left">
                📦 Initialize Purchase & Escrow
              </h3>
              <button onClick={() => setOrderingProduct(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderPlacedSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-gray-800">Order Locked & Escrow Prepped!</h4>
                <p className="text-xs text-gray-500">Redirecting to your Secure Escrow Orders panel to deposit contract funds...</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrderSubmit} className="p-5 space-y-4 text-left">
                {/* Product Summary */}
                <div className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <img src={orderingProduct.images[0]} alt={orderingProduct.title} className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800 line-clamp-1">{orderingProduct.title}</h4>
                    <span className="text-[10px] font-bold text-red-500 block">${orderingProduct.price} / {orderingProduct.unit}</span>
                    <span className="text-[9px] text-gray-400 font-mono">FOB Origin: {orderingProduct.location}</span>
                  </div>
                </div>

                {/* Quantity selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Order Quantity:</label>
                    <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">MOQ Required: {orderingProduct.moq} {orderingProduct.unit}</span>
                  </div>
                  <input
                    type="number"
                    min={orderingProduct.moq}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 font-black focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>

                {/* Secure Escrow Indicator Info */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block font-mono">AgriRED Secured Escrow</span>
                    <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">Your money is held in a secure trust bank. Exporter is only paid once cargo is cleared and phytosanitary certificates match.</span>
                  </div>
                </div>

                {/* Pricing totals */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-mono">ESTIMATED CONTRACT VALUE:</span>
                    <span className="text-sm font-black text-gray-800">${(orderingProduct.price * orderQuantity).toLocaleString()} USD</span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-xs font-black text-white rounded-xl shadow-md shadow-red-100 transition-all cursor-pointer"
                  >
                    Confirm Contract
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
