
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import type { Game, BlogPost, Product, SocialLink, Ad, Comment, SiteSettings, CategorySetting } from '../../types';
import AdminDashboard from '../../components/AdminDashboard';
import AdminForm from '../../components/AdminForm';
import ToastContainer from '../../components/ToastContainer';
import type { ToastData, ToastType } from '../../components/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { ICON_MAP } from '../../constants';

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

const AD_CONFIG: Record<string, { label: string; size: string; role: string }> = {
  home_quest_banner: { label: 'Home Quest Banner', size: '728x90', role: 'Main Promotion' },
  home_native_game: { label: 'Native In-Grid Ad', size: '300x250', role: 'Contextual Feed' },
  game_vertical: { label: 'Game Sidebar', size: '300x600', role: 'Sticky Visibility' },
  game_horizontal: { label: 'Game Bottom Mobile', size: '300x250', role: 'Action Trigger' },
  blog_skyscraper_left: { label: 'Blog Left', size: '160x600', role: 'Desktop Filler' },
  blog_skyscraper_right: { label: 'Blog Right', size: '160x600', role: 'Desktop Filler' },
  shop_square: { label: 'Shop Product Square', size: '300x250', role: 'Store Monetization' },
  footer_partner: { label: 'Footer Partner', size: '728x90', role: 'Exit Catch' }
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
  const [ads, setAds] = useState<Record<string, string>>({});
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
            const adsData = await adsRes.json();
            setAds(adsData.reduce((acc: any, ad: any) => ({ ...acc, [ad.placement]: ad.code || '' }), {}));
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
        body: JSON.stringify(ads)
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

  const handleUpdateCategory = async (cat: CategorySetting) => {
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify(cat)
    });
    if (res.ok) { addToast('Category optimized.', 'success'); refreshCurrentTab(); }
  };

  const handleApproveComment = async (id: number) => {
    const csrf = getCookie('csrf_token');
    const res = await fetch(`${API_BASE}/api/admin/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({ id })
    });
    if (res.ok) { addToast('Comment approved and live.', 'success'); refreshCurrentTab(); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500 font-black uppercase tracking-[0.5em] animate-pulse">Initializing Core...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
        <Head children={<title>Restricted Access - Terminal Admin</title>} />
        <div className="bg-gray-800 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <div className="flex flex-col items-center mb-10 relative z-10">
             <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h1 className="text-3xl font-black uppercase tracking-tighter">System Auth</h1>
             <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-black">Control Level 1 Access</p>
          </div>
          <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
              const data = await res.json();
              if (res.ok && data.success) { setIsAuthenticated(true); } else { setLoginError(data.message || 'Access Denied'); }
          }} className="space-y-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-900/80 rounded-2xl border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-center text-lg font-black tracking-widest" required placeholder="••••••••" />
            {loginError && <div className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-900/10 p-3 rounded-xl border border-red-500/20">{loginError}</div>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-purple-900/40 transform active:scale-95">Authorize Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-purple-500">
        <Head children={<title>Control Center | {settings.site_name}</title>} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {showForm && ['games', 'blogs', 'products', 'social-links'].includes(activeTab) && (
            <AdminForm item={editingItem} type={activeTab as any} onClose={() => setShowForm(false)} onSubmit={async (d) => {
                const csrf = getCookie('csrf_token');
                const method = editingItem ? 'PUT' : 'POST';
                const res = await fetch(`${API_BASE}/api/admin/${activeTab}`, { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' }, body: JSON.stringify(d) });
                if (res.ok) { addToast('Operation successful.', 'success'); setShowForm(false); refreshCurrentTab(); }
                else addToast('Operation failed.', 'error');
            }} />
        )}

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-purple-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 11-4m0 4v2m0-6V4" /></svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Control Center</h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Management Hub v2.5 Stable</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={async () => { await fetch('/api/auth/logout'); setIsAuthenticated(false); }} className="px-6 py-3 bg-red-900/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 transition-all">Emergency Logout</button>
                </div>
            </header>

            <AdminDashboard stats={stats} />
            
            <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {['analytics', 'games', 'blogs', 'products', 'categories', 'social-links', 'comments', 'ads', 'settings'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as TabType)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === tab ? 'bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-900/40' : 'bg-gray-800/50 border-white/5 text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            <main className="animate-fade-in">
                {activeTab === 'analytics' && analyticsData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <TopContentList title="Top Games" items={analyticsData.topGames} type="games" />
                        <TopContentList title="Top Blogs" items={analyticsData.topBlogs} type="blogs" />
                        <TopContentList title="Top Products" items={analyticsData.topProducts} type="products" />
                    </div>
                )}

                {activeTab === 'ads' && (
                    <form onSubmit={handleSaveAds} className="space-y-8 bg-gray-800/50 p-8 rounded-[2.5rem] border border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(AD_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex justify-between">
                                        <span>{cfg.label} <span className="text-gray-600 ml-2">({cfg.size})</span></span>
                                        <span className="text-purple-500">{cfg.role}</span>
                                    </label>
                                    <textarea value={ads[key] || ''} onChange={e => setAds({...ads, [key]: e.target.value})} className="w-full h-32 bg-gray-900 border border-gray-700 rounded-2xl p-4 font-mono text-[11px] text-green-400 focus:border-purple-500 outline-none resize-none" placeholder="<!-- Paste Ad Code Here -->" />
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-white/5 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all">Save Ad Ecosystem</button>
                        </div>
                    </form>
                )}

                {activeTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="space-y-10 bg-gray-800/50 p-8 rounded-[2.5rem] border border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Identity</h3>
                                <div className="space-y-4">
                                    <input type="text" value={settings.site_name} onChange={e=>setSettings({...settings, site_name:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm" placeholder="Site Name" />
                                    <input type="text" value={settings.site_icon_url} onChange={e=>setSettings({...settings, site_icon_url:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm" placeholder="Favicon URL" />
                                    <input type="text" value={settings.ogads_script_src} onChange={e=>setSettings({...settings, ogads_script_src:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm" placeholder="OGAds Full Script Tag" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Hero Section</h3>
                                <div className="space-y-4">
                                    <input type="text" value={settings.hero_title} onChange={e=>setSettings({...settings, hero_title:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm" placeholder="Hero Title (HTML ok)" />
                                    <textarea value={settings.hero_subtitle} onChange={e=>setSettings({...settings, hero_subtitle:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm h-20" placeholder="Hero Subtitle" />
                                    <input type="text" value={settings.hero_bg_url} onChange={e=>setSettings({...settings, hero_bg_url:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm" placeholder="Hero BG Image URL" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex justify-end">
                            <button type="submit" className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all">Apply Site Changes</button>
                        </div>
                    </form>
                )}

                {activeTab === 'categories' && (
                    <div className="bg-gray-800/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 border-b border-white/5">
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <th className="p-6">Section</th>
                                    <th className="p-6">Name</th>
                                    <th className="p-6">Icon</th>
                                    <th className="p-6">Show</th>
                                    <th className="p-6">Order</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {categories.map(cat => (
                                    <tr key={`${cat.section}-${cat.name}`} className="hover:bg-white/[0.02]">
                                        <td className="p-6 uppercase font-black text-[10px] text-purple-400">{cat.section}</td>
                                        <td className="p-6 font-bold">{cat.name} <span className="text-[10px] text-gray-600 font-bold ml-2">({cat.count} items)</span></td>
                                        <td className="p-6">
                                            <select value={cat.icon_name} onChange={e=>handleUpdateCategory({...cat, icon_name:e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg p-1 text-xs">
                                                {Object.keys(ICON_MAP).map(i=><option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-6">
                                            <button onClick={()=>handleUpdateCategory({...cat, show_in_sidebar: !cat.show_in_sidebar})} className={`w-10 h-5 rounded-full transition-all relative ${cat.show_in_sidebar?'bg-green-600':'bg-gray-700'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cat.show_in_sidebar?'left-6':'left-1'}`} />
                                            </button>
                                        </td>
                                        <td className="p-6"><input type="number" value={cat.sort_order} onChange={e=>handleUpdateCategory({...cat, sort_order: parseInt(e.target.value)})} className="bg-gray-900 border border-gray-700 w-16 p-1 rounded text-xs" /></td>
                                        <td className="p-6 text-right text-xs text-gray-600">Autosave Active</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {['games', 'blogs', 'products', 'social-links', 'comments'].includes(activeTab) && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                            <div className="relative flex-1 max-w-xl">
                                <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-gray-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" placeholder={`Secure filter: ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-800/80 rounded-2xl border border-white/5 outline-none focus:border-purple-500/50 text-sm transition-all" />
                            </div>
                            {activeTab !== 'comments' && (
                                <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-green-900/40">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                    Add New Record
                                </button>
                            )}
                        </div>

                        <div className="bg-gray-800/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6">
                                    <div className="w-16 h-16 border-[6px] border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Fetching Data Stream...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-900/50 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="p-6 w-20">ID</th>
                                                <th className="p-6">Content / Entity</th>
                                                <th className="p-6">Meta</th>
                                                <th className="p-6">State</th>
                                                <th className="p-6 text-right">Ops</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {items.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-6 text-xs font-mono text-gray-600">#{item.id}</td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 flex-shrink-0 overflow-hidden relative shadow-lg">
                                                                {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-gray-700">NA</div>}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight text-sm line-clamp-1">{item.title || item.name || (item.text?.slice(0, 30) + '...')}</span>
                                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.author || item.category || 'System'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Views: {item.view_count || 0}</span>
                                                            <span className="text-[10px] font-black text-purple-600/60 uppercase tracking-tighter">{item.category || 'Global'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${item.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/20' : 'bg-green-900/20 text-green-500 border-green-500/20'}`}>
                                                            {item.status || (item.isPinned ? 'PINNED' : 'ACTIVE')}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex justify-end gap-3">
                                                            {activeTab === 'comments' && item.status === 'pending' && (
                                                                <button onClick={() => handleApproveComment(item.id)} className="p-3 bg-green-900/20 hover:bg-green-600 text-green-500 hover:text-white rounded-xl transition-all shadow-lg border border-green-500/20">
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {activeTab !== 'comments' && (
                                                                <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="p-3 bg-gray-700/50 hover:bg-purple-600 text-white rounded-xl transition-all shadow-lg border border-white/5">
                                                                    Edit
                                                                </button>
                                                            )}
                                                            <button onClick={async () => {
                                                                if(!confirm('Destroy database record?')) return;
                                                                const csrf = getCookie('csrf_token');
                                                                await fetch(`${API_BASE}/api/admin/${activeTab}?id=${item.id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': csrf || '' } });
                                                                refreshCurrentTab();
                                                            }} className="p-3 bg-gray-700/50 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg border border-white/5">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {items.length === 0 && (
                                        <div className="py-32 text-center flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6 text-gray-800 border border-white/5">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">No Data Found in Terminal</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
