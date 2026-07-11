import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShoppingCart, Search, MessageSquare, Bot, Hand,
  Star, ChevronLeft, Menu, User, CheckCircle, XCircle
} from 'lucide-react';
import { AgentContext }  from '../../context/AgentContext';
import toast             from 'react-hot-toast';
import { StatusBadge }   from '../../components/StatusBadge/StatusBadge';
import { AiConsole }     from '../../components/AiConsole/AiConsole';
import { StorefrontProductSkeleton } from '../../components/Skeleton/Skeleton';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    price: 348.00, rating: 4.8, reviews: 1245, category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80',
    description: 'Industry-leading noise cancellation with two processors controlling 8 microphones. Auto NC Optimizer adapts to your environment automatically for unprecedented silence.',
  },
  {
    id: 2,
    name: 'Keychron Q1 Pro Mechanical Keyboard',
    price: 199.00, rating: 4.9, reviews: 432, category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80',
    description: 'Fully customisable 75% QMK/VIA wireless keyboard with a CNC-machined aluminium body. Hot-swappable switches and gasket mount for a premium typing experience.',
  },
  {
    id: 3,
    name: 'Logitech MX Master 3S Wireless Mouse',
    price: 99.99, rating: 4.7, reviews: 890, category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80',
    description: 'Quiet Clicks and an 8,000 DPI track-on-glass sensor. Works on any surface, connects to up to three devices with Easy-Switch.',
  },
  {
    id: 4,
    name: 'LG 27" UltraGear OLED Gaming Monitor',
    price: 899.99, rating: 4.6, reviews: 210, category: 'Displays',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80',
    description: '240 Hz OLED panel with 0.03 ms response time. Prepare for ultra-smooth gameplay, vivid colours, and deep blacks that IPS cannot match.',
  },
  {
    id: 5,
    name: 'Apple iPad Pro 12.9-inch (M2)',
    price: 1099.00, rating: 4.9, reviews: 3402, category: 'Tablets',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
    description: 'M2 chip, Liquid Retina XDR display, Thunderbolt, and Wi-Fi 6E. The most powerful iPad Apple has ever made.',
  },
  {
    id: 6,
    name: 'Bose SoundLink Revolve+ II',
    price: 329.00, rating: 4.7, reviews: 1823, category: 'Audio',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80',
    description: 'True 360° sound with deep, loud, lifelike audio. IPX5 water-resistant with up to 17 hours battery life.',
  },
];

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Displays', 'Tablets', 'Audio'];

// ─── Verify result flash banner ────────────────────────────────────────────────
const ResultBanner = ({ banner }) => (
  <AnimatePresence>
    {banner && (
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3
          px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border backdrop-blur-md pointer-events-none
          ${banner.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100'
            : 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100'}`}
      >
        {banner.type === 'success'
          ? <CheckCircle className="w-5 h-5 text-emerald-500" />
          : <XCircle     className="w-5 h-5 text-rose-500" />}
        {banner.message}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main component ────────────────────────────────────────────────────────────
export const Storefront = () => {
  const { agentId }                  = useParams();
  const { getAgent, addLog }         = useContext(AgentContext);

  const [mode,            setMode]            = useState('manual');
  const [banner,          setBanner]          = useState(null);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedCategory,setSelectedCategory]= useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart,            setCart]            = useState([]);
  const [reviewText,      setReviewText]      = useState('');

  const isLoading = useSimulatedLoading(800);

  const agent = getAgent(agentId);

  // log initial connection once
  useEffect(() => {
    if (!agent) return;
    addLog({ agentId: agent.id, agentName: agent.name, action: 'Connection Established', status: 'Approved', reason: 'Valid Token' });
  }, [agentId]); // eslint-disable-line

  // ── helpers ───────────────────────────────────────────────────────────────
  const flash = (type, message, ms = 4000) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), ms);
  };

  const verifyAction = async (actionType) => {
    if (!agent || agent.status !== 'Active') {
      flash('error', `Access Denied — Passport is ${agent?.status ?? 'invalid'}`);
      addLog({ agentId: agent?.id, agentName: agent?.name, action: actionType, status: 'Denied', reason: `Status: ${agent?.status}` });
      return false;
    }
    const ok = agent.permissions.includes(actionType);
    flash(ok ? 'success' : 'error',
      ok
        ? `AI Passport ✓ — ${actionType} permission verified.`
        : `AI Passport ✗ — ${actionType} permission denied.`
    );
    addLog({ agentId: agent.id, agentName: agent.name, action: actionType, status: ok ? 'Approved' : 'Denied', reason: ok ? 'Permission granted' : 'Missing permission' });
    return ok;
  };

  // ── manual handlers ───────────────────────────────────────────────────────
  const onProductClick = async (product) => {
    if (mode !== 'manual') return;
    const ok = await verifyAction('Browse');
    if (ok) setSelectedProduct(product);
  };

  const onPurchase = async () => {
    if (mode !== 'manual') return;
    const ok = await verifyAction('Purchase');
    if (ok) {
      setCart(prev => [...prev, selectedProduct]);
      toast.success(`${selectedProduct.name} added to cart!`);
    }
  };

  const onPostReview = async () => {
    if (mode !== 'manual' || !reviewText.trim()) return;
    const ok = await verifyAction('Post');
    if (ok) { toast.success('Review posted!'); setReviewText(''); }
  };

  // ── ai console callbacks ──────────────────────────────────────────────────
  const aiBrowse     = () => { setSearchQuery('Headphones'); setSelectedProduct(PRODUCTS[0]); };
  const aiPurchase   = () => setCart(prev => [...prev, PRODUCTS[0]]);
  const aiPostReview = () => toast.success('AI posted a review!');
  const aiFallback   = () => { toast('AI handed control back to you.', { icon: '🤖' }); setMode('manual'); };
  const aiComplete   = () => {};

  // ── derived ───────────────────────────────────────────────────────────────
  const filtered = PRODUCTS.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (selectedCategory === 'All' || p.category === selectedCategory)
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Agent Not Found</h1>
        <p className="text-slate-500 mb-6">This session is invalid or has expired.</p>
        <Link to="/dashboard" className="text-blue-600 font-medium hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">
      <ResultBanner banner={banner} />

      <div className="flex-1 flex overflow-hidden h-screen">

        {/* ── LEFT: Store ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top Navbar */}
          <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between z-30 shadow-sm shrink-0">
            <div className="flex items-center gap-5">
              <Link to="/dashboard" className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-xs font-medium border-r border-slate-200 pr-5 mr-1">
                <ChevronLeft className="w-4 h-4" /> Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">NexaMart</span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, brands…"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedProduct(null); }}
                  className="w-full bg-slate-100 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border-none"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 text-slate-600 text-sm">
                <User className="w-5 h-5" />
              </button>
              <button className="relative p-2 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 text-slate-600">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <motion.span
                    key={cart.length}
                    initial={{ scale: 1.6 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </button>
            </div>
          </header>

          {/* Category bar */}
          <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex gap-1 overflow-x-auto shrink-0 no-scrollbar">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 shrink-0 px-3 py-1.5 rounded-lg">
              <Menu className="w-3.5 h-3.5" /> All
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1 self-center" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSelectedProduct(null); }}
                className={`text-xs font-semibold shrink-0 px-3 py-1.5 rounded-full transition-colors
                  ${selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Store body */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 no-scrollbar">
            <div className="max-w-5xl mx-auto">

              <AnimatePresence mode="wait">
                {!selectedProduct ? (

                  /* ── Product Grid ─────────────────────────────────────── */
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Trending Tech</h1>
                        <p className="text-sm text-slate-500 mt-0.5">{filtered.length} products</p>
                      </div>
                    </div>

                    {filtered.length === 0
                      ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-900 mb-1">No results</h3>
                          <p className="text-slate-400 text-sm">Try a different search or category.</p>
                        </div>
                      )
                      : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                              <StorefrontProductSkeleton key={i} />
                            ))
                          ) : (
                            filtered.map(product => (
                              <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                onClick={() => onProductClick(product)}
                                className={`bg-white rounded-2xl overflow-hidden border border-slate-200
                                  hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group flex flex-col
                                  ${mode === 'ai' ? 'pointer-events-none opacity-75' : ''}`}
                              >
                                <div className="relative overflow-hidden aspect-square bg-slate-100">
                                  <img src={product.image} alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 to-transparent">
                                    <span className="bg-white text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                                      Click to Browse ↗
                                    </span>
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{product.category}</p>
                                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 flex-1">{product.name}</h3>
                                  <div className="flex items-center gap-1 mb-3">
                                    <div className="flex text-amber-400">
                                      {[...Array(5)].map((_,i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-25'}`} />
                                      ))}
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">{product.rating}</span>
                                    <span className="text-xs text-slate-400">({product.reviews})</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      )}
                  </motion.div>

                ) : (

                  /* ── Product Detail ───────────────────────────────────── */
                  <motion.div key="detail" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                  >
                    <div className="px-6 py-4 border-b border-slate-100">
                      <button onClick={() => setSelectedProduct(null)}
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Products
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-10">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex flex-col justify-center">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">{selectedProduct.category}</p>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">{selectedProduct.name}</h2>

                        <div className="flex items-center gap-2 mb-5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_,i)=>(
                              <Star key={i} className={`w-4 h-4 ${i<Math.floor(selectedProduct.rating)?'fill-current':'opacity-25'}`}/>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{selectedProduct.rating}</span>
                          <span className="text-sm text-slate-400">({selectedProduct.reviews} reviews)</span>
                        </div>

                        <p className="text-3xl font-black text-slate-900 mb-5">${selectedProduct.price.toFixed(2)}</p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-7">{selectedProduct.description}</p>

                        {/* Buy button — triggers Purchase verify */}
                        <button
                          onClick={onPurchase}
                          disabled={mode !== 'manual'}
                          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-base
                            transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]
                            disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2.5"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart  <span className="opacity-50 font-normal text-sm">(tests Purchase)</span>
                        </button>

                        {/* Review — triggers Post verify */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <h3 className="font-bold text-slate-900 mb-3">Leave a Review</h3>
                          <textarea
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            disabled={mode !== 'manual'}
                            placeholder="What did you think of this product?"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 mb-3 disabled:opacity-50"
                          />
                          <button
                            onClick={onPostReview}
                            disabled={mode !== 'manual' || !reviewText.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Submit Review  <span className="opacity-50 font-normal">(tests Post)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ── RIGHT: Agent Panel ───────────────────────────────────────────── */}
        <aside className="w-[380px] shrink-0 bg-[#0F172A] border-l border-white/10 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.15)] z-40">

          {/* Agent identity header */}
          <div className="p-5 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/25">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Passport</p>
                  <p className="text-sm font-bold text-white">{agent.name}</p>
                </div>
              </div>
              <StatusBadge status={agent.status} />
            </div>

            {/* Mode toggle */}
            <div className="flex bg-slate-800/70 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                  ${mode === 'manual'
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Hand className="w-3.5 h-3.5" /> Manual
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                  ${mode === 'ai'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Bot className="w-3.5 h-3.5" /> AI Auto
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-hidden p-5 flex flex-col">

            {mode === 'manual' ? (
              /* Manual hint */
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-white/10 flex items-center justify-center mb-5"
                >
                  <Hand className="w-7 h-7 text-slate-400" />
                </motion.div>
                <h4 className="font-bold text-white mb-2">Manual Control</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  You are driving. Interact with the store on the left — AI Passport will verify permissions for each action automatically.
                </p>
                <div className="mt-8 space-y-2 text-left w-full max-w-[260px]">
                  {[
                    { label: 'Click a product card', desc: 'Tests Browse permission' },
                    { label: 'Click Add to Cart',     desc: 'Tests Purchase permission' },
                    { label: 'Submit a Review',       desc: 'Tests Post permission' },
                  ].map(h => (
                    <div key={h.label} className="flex items-start gap-2.5 bg-slate-800/40 rounded-xl p-3 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-200">{h.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* AI Console */
              <AiConsole
                key={mode}           // remount when switching to AI
                agent={agent}
                onBrowse={aiBrowse}
                onPurchase={aiPurchase}
                onPostReview={aiPostReview}
                onFallback={aiFallback}
                onComplete={aiComplete}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
