
/* ... existing imports ... */
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
  const [adData, setAdData] = useState<Record<string, { code: string, fallback_code: string }>>({});
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<CategorySetting[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adPreviewToggles, setAdPreviewToggles] = useState<Record<string, 'primary' | 'fallback'>>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [toasts, setToasts] = useState<ToastData[]>([]);

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

  const handleApproveComment = async (id: number) => {
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({ id })
    });
    if (res.ok) { addToast('Comment approved.', 'success'); refreshCurrentTab(); }
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
                else { addToast('Operation failed.', 'error'); }
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
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Infrastructure v3.5 [RESTORING PREVIEW]</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={async () => { await fetch(`${API_BASE}/api/auth/logout`); window.location.reload(); }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Terminate</button>
                    <a href="/" target="_blank" className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">Live Site</a>
                </div>
            </header>

            <AdminDashboard stats={stats} />

            <div className="flex flex-wrap gap-2 mb-10 bg-gray-900/50 p-2 rounded-3xl border border-white/5 overflow-x-auto no-scrollbar">
                {['analytics', 'games', 'blogs', 'products', 'categories', 'comments', 'ads', 'social-links', 'settings'].map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab as TabType); setCurrentPage(1); }} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border whitespace-nowrap ${activeTab === tab ? 'bg-purple-600 text-white border-purple-500 shadow-xl' : 'bg-gray-800 text-gray-400 border-white/5 hover:bg-gray-800/80'}`}>
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <main className="bg-gray-900/30 rounded-[3rem] p-4 lg:p-10 border border-white/5 shadow-inner min-h-[600px] relative">
                
                {/* 1. Analytics Tab */}
                {activeTab === 'analytics' && analyticsData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        <TopContentList title="Top Played Games" items={analyticsData.topGames} type="games" />
                        <TopContentList title="Most Read Articles" items={analyticsData.topBlogs} type="blogs" />
                        <TopContentList title="Trending Products" items={analyticsData.topProducts} type="products" />
                    </div>
                )}

                {/* 2. Main Content Tabs (Games, Blogs, Products, Social) */}
                {['games', 'blogs', 'products', 'social-links'].includes(activeTab) && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{activeTab.replace('-', ' ')} Manager</h2>
                            <div className="flex w-full md:w-auto gap-4">
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search database..." className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-3 text-sm focus:border-purple-500 outline-none flex-grow md:w-64" />
                                <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">+ New Entry</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-[2rem] border border-white/5">
                            <table className="w-full text-left border-collapse bg-gray-800/20">
                                <thead>
                                    <tr className="bg-gray-800/40 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/5">
                                        <th className="px-6 py-4">Identity</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Stats / Meta</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-800 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                                        <img src={item.imageUrl || item.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-200 text-sm">{item.title || item.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono">/{item.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-gray-900 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-400">{item.category}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.view_count || 0} Views</span>
                                                    {activeTab === 'games' && <span className="text-[9px] text-gray-500 font-bold uppercase">{item.platform}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {item.isPinned ? <span className="text-[9px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase">Pinned</span> : <span className="text-[9px] text-gray-600 font-bold uppercase">Static</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="p-2 hover:bg-purple-600/20 text-purple-400 rounded-lg transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex justify-between items-center bg-gray-800/40 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Showing {items.length} of {pagination.totalItems} entries</span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 transition-all font-black text-[10px] uppercase">Prev</button>
                                <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 transition-all font-black text-[10px] uppercase">Next</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Taxonomy Manager</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat, idx) => (
                                <div key={`${cat.section}-${cat.name}`} className="bg-gray-800/50 border border-white/5 rounded-[2rem] p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-purple-500 border border-white/5">
                                                {ICON_MAP[cat.icon_name] || ICON_MAP['Gamepad2']}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{cat.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-black">{cat.section}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-white bg-purple-600 px-2 py-0.5 rounded uppercase">{cat.count} items</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Visibility</label>
                                            <button onClick={async () => {
                                                const csrf = getCookie('csrf_token');
                                                await fetch(`${API_BASE}/api/admin/categories`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' }, body: JSON.stringify({ ...cat, show_in_sidebar: !cat.show_in_sidebar }) });
                                                refreshCurrentTab();
                                            }} className={`w-full py-2 rounded-lg text-[9px] font-black uppercase transition-all ${cat.show_in_sidebar ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                                {cat.show_in_sidebar ? 'In Sidebar' : 'Hidden'}
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Sort Order</label>
                                            <input type="number" value={cat.sort_order} onChange={async (e) => {
                                                const val = parseInt(e.target.value);
                                                const csrf = getCookie('csrf_token');
                                                await fetch(`${API_BASE}/api/admin/categories`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' }, body: JSON.stringify({ ...cat, sort_order: val }) });
                                                setCategories(prev => prev.map(c => c.name === cat.name && c.section === cat.section ? { ...c, sort_order: val } : c));
                                            }} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-[10px] text-white outline-none" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Comments Tab */}
                {activeTab === 'comments' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Community Feedback</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {items.length === 0 ? <p className="text-gray-500 italic">No comments awaiting review.</p> : items.map((comment) => (
                                <div key={comment.id} className={`bg-gray-800/50 border rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${comment.status === 'pending' ? 'border-orange-500/30 bg-orange-900/5' : 'border-white/5'}`}>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-white text-sm">{comment.author}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-black">On Article: {comment.blog_title}</span>
                                            {comment.status === 'pending' && <span className="bg-orange-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Moderation Req</span>}
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed italic">"{comment.text}"</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {comment.status === 'pending' && <button onClick={() => handleApproveComment(comment.id)} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Approve</button>}
                                        <button onClick={() => handleDeleteItem(comment.id)} className="px-6 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Ads Tab */}
                {activeTab === 'ads' && (
                    <div className="space-y-12 animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Monetization Engine</h2>
                            <button onClick={handleSaveAds} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Deploy Logic</button>
                        </div>
                        <div className="grid grid-cols-1 gap-16">
                            {Object.entries(AD_CONFIG).map(([key, config]) => (
                                <div key={key} className="bg-gray-800/50 border border-white/5 rounded-[3rem] p-8 lg:p-12 space-y-10 group shadow-2xl">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-white/5 pb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{config.label}</h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{config.size} • {config.role}</p>
                                        </div>
                                        <div className="flex bg-gray-900 rounded-xl p-1.5 border border-white/10">
                                            <button onClick={() => setAdPreviewToggles(p => ({...p, [key]: 'primary'}))} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${adPreviewToggles[key] !== 'fallback' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500'}`}>Test Primary</button>
                                            <button onClick={() => setAdPreviewToggles(p => ({...p, [key]: 'fallback'}))} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${adPreviewToggles[key] === 'fallback' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'}`}>Test Fallback</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Primary Code</label>
                                                <textarea value={adData[key]?.code || ''} onChange={(e) => setAdData(prev => ({ ...prev, [key]: { ...prev[key], code: e.target.value } }))} className="w-full h-48 bg-gray-900 border border-gray-700 rounded-2xl p-5 font-mono text-xs text-blue-300 outline-none focus:border-purple-500 transition-all resize-none shadow-inner" placeholder="Paste Ad HTML/Script code here..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Fallback Code</label>
                                                <textarea value={adData[key]?.fallback_code || ''} onChange={(e) => setAdData(prev => ({ ...prev, [key]: { ...prev[key], fallback_code: e.target.value } }))} className="w-full h-48 bg-gray-900 border border-gray-700 rounded-2xl p-5 font-mono text-xs text-orange-200 outline-none focus:border-orange-500 transition-all resize-none shadow-inner" placeholder="Paste Fallback HTML..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                Live Deployment Preview ({adPreviewToggles[key] === 'fallback' ? 'Fallback' : 'Primary'})
                                            </label>
                                            <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-6 flex items-center justify-center min-h-[300px] relative overflow-hidden shadow-inner">
                                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                                                <Ad 
                                                    placement={key} 
                                                    showLabel={false} 
                                                    isPreview={true}
                                                    overrideCode={adPreviewToggles[key] === 'fallback' ? (adData[key]?.fallback_code || '') : (adData[key]?.code || '')} 
                                                    className="bg-transparent border-0 scale-90 md:scale-100" 
                                                />
                                            </div>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase text-center tracking-widest italic">Simulation of user-end rendering</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Settings Tab */}
                {activeTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Global Parameters</h2>
                            <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Commit Settings</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-800/50 border border-white/5 rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest border-b border-white/5 pb-4">Brand Identity</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Site Name</label>
                                        <input type="text" value={settings.site_name || ''} onChange={e=>setSettings({...settings, site_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Icon URL (Favicon)</label>
                                        <input type="text" value={settings.site_icon_url || ''} onChange={e=>setSettings({...settings, site_icon_url: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 border border-white/5 rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest border-b border-white/5 pb-4">Locker Engine (OGAds)</h3>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Content Locker Script Src</label>
                                    <textarea value={settings.ogads_script_src || ''} onChange={e=>setSettings({...settings, ogads_script_src: e.target.value})} className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs font-mono text-blue-400 outline-none focus:border-purple-500" placeholder="<script src='...'></script>" />
                                </div>
                            </div>
                        </div>
                    </form>
                )}

            </main>
        </div>
    </div>
  );
}
