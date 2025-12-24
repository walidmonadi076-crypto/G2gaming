
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import type { Ad as AdType, SiteSettings, CategorySetting } from '../../types';
import AdminDashboard from '../../components/AdminDashboard';
import AdminForm from '../../components/AdminForm';
import ToastContainer from '../../components/ToastContainer';
import type { ToastData, ToastType } from '../../components/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { ICON_MAP } from '../../constants';
import Ad from '../../components/Ad';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : '');

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

type TabType = 'games' | 'blogs' | 'products' | 'social-links' | 'comments' | 'ads' | 'settings' | 'analytics' | 'categories';
interface PaginationState { totalItems: number; totalPages: number; currentPage: number; itemsPerPage: number; }
interface AdminStats { totalGames: number; totalBlogs: number; totalProducts: number; gameCategories: number; blogCategories: number; productCategories: number; totalSocialLinks: number; totalComments: number; totalAds: number; }
interface TopItem { name: string; slug: string; view_count: number; }
interface AnalyticsData { topGames: TopItem[]; topBlogs: TopItem[]; topProducts: TopItem[]; }

const AD_CONFIG: Record<string, { label: string; size: string; role: string; placement: any }> = {
  home_quest_banner: { label: 'Home Quest Banner', size: '728x90', role: 'Main Promotion', placement: 'home_quest_banner' },
  home_native_game: { label: 'Native In-Grid Ad', size: '300x250', role: 'Contextual Feed', placement: 'home_native_game' },
  game_vertical: { label: 'Game Sidebar', size: '300x600', role: 'Sticky Visibility', placement: 'game_vertical' },
  game_horizontal: { label: 'Game Bottom Mobile', size: '300x250', role: 'Action Trigger', placement: 'game_horizontal' },
  blog_skyscraper_left: { label: 'Blog Left', size: '160x600', role: 'Desktop Filler', placement: 'blog_skyscraper_left' },
  blog_skyscraper_right: { label: 'Blog Right', size: '160x600', role: 'Desktop Filler', placement: 'blog_skyscraper_right' },
  shop_square: { label: 'Shop Product Square', size: '300x250', role: 'Store Monetization', placement: 'shop_square' },
  footer_partner: { label: 'Footer Partner', size: '728x90', role: 'Exit Catch', placement: 'footer_partner' }
};

const TopContentList = ({title, items, type}: {title: string, items: TopItem[], type: 'games' | 'blogs' | 'products'}) => {
    const maxViews = Math.max(...items.map(item => item.view_count), 1);
    return (
        <div className="bg-gray-800/50 border border-white/5 rounded-[2rem] p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                {title}
            </h3>
            {items.length === 0 ? <p className="text-gray-500 text-sm italic">No activity recorded yet.</p> : (
                <ol className="space-y-4">
                    {items.map((item, index) => (
                        <li key={item.slug} className="group">
                            <div className="flex justify-between items-center mb-2">
                                <a href={`/${type === 'products' ? 'shop' : type === 'blogs' ? 'blog' : type}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 group-hover:text-purple-400 transition-colors truncate pr-4 text-xs uppercase tracking-wider">{index + 1}. {item.name}</a>
                                <span className="font-black text-white text-[10px] bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/20">{item.view_count.toLocaleString()} Vues</span>
                            </div>
                            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(item.view_count / maxViews) * 100}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  // adData now stores { code, fallback_code }
  const [adData, setAdData] = useState<Record<string, { code: string, fallback_code: string }>>({});
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<CategorySetting[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const [previewingAdPlacement, setPreviewingAdPlacement] = useState<string | null>(null);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchInitialAdminData = useCallback(async () => {
    try {
        const [statsRes, adsRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE}/api/admin/stats`),
            fetch(`${API_BASE}/api/admin/ads`),
            fetch(`${API_BASE}/api/admin/settings`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (adsRes.ok) {
            const adsJson = await adsRes.json();
            const mapped = adsJson.reduce((acc: any, ad: any) => ({ 
              ...acc, 
              [ad.placement]: { code: ad.code || '', fallback_code: ad.fallback_code || '' } 
            }), {});
            setAdData(mapped);
        }
        if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (error) { addToast('Core data sync failed.', 'error'); }
  }, [addToast]);

  const refreshCurrentTab = useCallback(async () => {
    if (activeTab === 'analytics') {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/analytics`);
        if (res.ok) setAnalyticsData(await res.json());
        setLoading(false);
    } else if (activeTab === 'categories') {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/categories`);
        if (res.ok) setCategories(await res.json());
        setLoading(false);
    } else if (['games', 'blogs', 'products', 'social-links', 'comments'].includes(activeTab)) {
        setLoading(true);
        const url = `${API_BASE}/api/admin/${activeTab}?page=${currentPage}&search=${encodeURIComponent(debouncedSearchQuery)}&limit=${pagination.itemsPerPage}&sortBy=${sortConfig.key}&sortOrder=${sortConfig.direction}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setItems(data.items);
            setPagination(data.pagination);
        }
        setLoading(false);
    }
    fetchInitialAdminData();
  }, [activeTab, currentPage, debouncedSearchQuery, sortConfig, pagination.itemsPerPage, fetchInitialAdminData]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/check`);
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (e) { setIsAuthenticated(false); }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshCurrentTab();
  }, [isAuthenticated, activeTab, currentPage, debouncedSearchQuery, sortConfig]);

  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify(adData)
    });
    if (res.ok) addToast('Ad ecosystem updated successfully.', 'success');
    else addToast('Failed to deploy ads.', 'error');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify(settings)
    });
    if (res.ok) addToast('Master settings deployed.', 'success');
    else addToast('Configuration error.', 'error');
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("⚠️ ATTENTION: Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/${activeTab}?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrf || '' }
    });
    if (res.ok) { addToast('Entity purged.', 'success'); refreshCurrentTab(); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500 font-black uppercase tracking-[0.5em] animate-pulse">Initializing Core...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
        <Head><title>Restricted Access - Terminal Admin</title></Head>
        <div className="bg-gray-800 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-white/5 relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
             <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h1 className="text-3xl font-black uppercase tracking-tighter">System Auth</h1>
          </div>
          <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
              const data = await res.json();
              if (res.ok && data.success) { setIsAuthenticated(true); } else { setLoginError(data.message || 'Access Denied'); }
          }} className="space-y-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-900/80 rounded-2xl border border-gray-700 text-center text-lg font-black tracking-widest" required placeholder="••••••••" />
            {loginError && <div className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-900/10 p-3 rounded-xl border border-red-500/20">{loginError}</div>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-purple-500">
        <Head><title>Control Center | {settings.site_name}</title></Head>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {showForm && (
            <AdminForm item={editingItem} type={activeTab as any} onClose={() => setShowForm(false)} onSubmit={async (d) => {
                const csrf = getCookie('csrf_token');
                const method = editingItem ? 'PUT' : 'POST';
                const res = await fetch(`${API_BASE}/api/admin/${activeTab}`, { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' }, body: JSON.stringify(d) });
                if (res.ok) { addToast('Operation successful.', 'success'); setShowForm(false); refreshCurrentTab(); }
            }} />
        )}

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Control Panel</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Infrastructure v3.2 [GEO-AD READY]</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={async () => { await fetch(`${API_BASE}/api/auth/logout`); window.location.reload(); }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Terminate</button>
                    <a href="/" target="_blank" className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">Live Site</a>
                </div>
            </header>

            <AdminDashboard stats={stats} />

            <div className="flex flex-wrap gap-2 mb-10 bg-gray-900/50 p-2 rounded-3xl border border-white/5">
                {['analytics', 'games', 'blogs', 'products', 'categories', 'comments', 'ads', 'social-links', 'settings'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab as TabType); setCurrentPage(1); }} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border ${activeTab === tab ? 'bg-purple-600 text-white border-purple-500 shadow-xl' : 'bg-gray-800 text-gray-400 border-white/5 hover:bg-gray-800/80'}`}>
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <main className="bg-gray-900/30 rounded-[3rem] p-4 lg:p-10 border border-white/5 shadow-inner min-h-[600px]">
                {activeTab === 'analytics' && analyticsData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        <TopContentList title="Top Played Games" items={analyticsData.topGames} type="games" />
                        <TopContentList title="Most Read Articles" items={analyticsData.topBlogs} type="blogs" />
                        <TopContentList title="Trending Products" items={analyticsData.topProducts} type="products" />
                    </div>
                )}

                {activeTab === 'ads' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Monetization Engine</h2>
                            <button onClick={handleSaveAds} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Deploy Logic</button>
                        </div>
                        <div className="grid grid-cols-1 gap-12">
                            {Object.entries(AD_CONFIG).map(([key, config]) => (
                                <div key={key} className="bg-gray-800/50 border border-white/5 rounded-[2rem] p-8 space-y-6 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{config.label}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{config.size} • {config.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Primary Code (Main Regions)
                                            </label>
                                            <textarea 
                                                value={adData[key]?.code || ''} 
                                                onChange={(e) => setAdData(prev => ({ ...prev, [key]: { ...prev[key], code: e.target.value } }))}
                                                className="w-full h-48 bg-gray-900 border border-gray-700 rounded-2xl p-5 font-mono text-xs text-blue-300 outline-none focus:border-purple-500 transition-all resize-none shadow-inner"
                                                placeholder="Paste Ad HTML/Script code here..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Fallback Code (Restricted Regions/USA)
                                            </label>
                                            <textarea 
                                                value={adData[key]?.fallback_code || ''} 
                                                onChange={(e) => setAdData(prev => ({ ...prev, [key]: { ...prev[key], fallback_code: e.target.value } }))}
                                                className="w-full h-48 bg-gray-900 border border-gray-700 rounded-2xl p-5 font-mono text-xs text-orange-200 outline-none focus:border-orange-500 transition-all resize-none shadow-inner"
                                                placeholder="Paste Fallback HTML (Image Link or Alternative Network)..."
                                            />
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-600 uppercase italic">PLACEMENT_ID: {config.placement}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* ... (rest of tabs logic remains same) */}
            </main>
        </div>
    </div>
  );
}
