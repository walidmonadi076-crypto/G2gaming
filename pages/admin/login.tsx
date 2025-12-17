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
import AdComponent from '../../components/Ad';

// Define a base URL for all API calls in this file.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : '');

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

type FormItem = Game | BlogPost | Product | SocialLink;
type Item = FormItem | Comment;
type FormItemType = 'games' | 'blogs' | 'products' | 'social-links';

const AD_CONFIG: Record<string, { label: string; size: string; type: string; device: string; visibility: string; uxScore: string; revenuePotential: string; role: string; issue?: string; fix?: string }> = {
  home_quest_banner: { label: 'Home Quest Banner', size: '728x90', type: 'Banner', device: 'All Devices', visibility: '95% (High)', uxScore: '9/10', revenuePotential: 'High', role: 'Gamified Entry Point', issue: 'Too wide on mobile (clips)', fix: 'Applied smart scaling CSS.' },
  home_native_game: { label: 'Games Grid Native Card', size: '300x250', type: 'Native', device: 'All Devices', visibility: '100% (In-Grid)', uxScore: '10/10', revenuePotential: 'High', role: 'The Chameleon (In-Feed)', fix: 'Moved to /games page grid.' },
  game_vertical: { label: 'Game Page Sidebar', size: '300x600', type: 'Skyscraper', device: 'Desktop Only', visibility: '100% (Sticky)', uxScore: '9/10', revenuePotential: 'Very High', role: 'High Visibility Anchor', fix: 'Made sticky.' },
  game_horizontal: { label: 'Game Page Mobile Area', size: '300x250', type: 'Rect', device: 'Mobile & Tablet', visibility: '90%', uxScore: '8.5/10', revenuePotential: 'Medium', role: 'Conversion King', fix: 'Placed below Download button.' },
  blog_skyscraper_left: { label: 'Blog Left Sidebar', size: '160x600', type: 'Skyscraper', device: 'Desktop Only', visibility: '60%', uxScore: '8/10', revenuePotential: 'Medium', role: 'Desktop Filler', fix: 'Hidden on mobile.' },
  blog_skyscraper_right: { label: 'Blog Right Sidebar', size: '160x600', type: 'Skyscraper', device: 'Desktop Only', visibility: '60%', uxScore: '8/10', revenuePotential: 'Medium', role: 'Desktop Filler', fix: 'Hidden on mobile.' },
  shop_square: { label: 'Shop Product Ad', size: '300x250', type: 'Rect', device: 'All Devices', visibility: '95%', uxScore: '9/10', revenuePotential: 'Medium', role: 'Buy Box Sponsor', fix: 'Positioned inside purchase area.' },
  quest_page_wall: { label: 'Quest Page Offerwall', size: 'Responsive', type: 'Offerwall', device: 'All Devices', visibility: '100%', uxScore: 'N/A', revenuePotential: 'Maximum', role: 'High Ticket Monetization', fix: 'Dedicated page.' },
  footer_partner: { label: 'Footer Partner Grid', size: '728x90', type: 'Leaderboard', device: 'All Devices', visibility: 'Low', uxScore: '10/10', revenuePotential: 'Low', role: 'Exit Catch', fix: 'Added to footer.' }
};
const AD_PLACEMENTS = Object.keys(AD_CONFIG);

const CSV_TEMPLATES = {
    games: "title,category,imageUrl,description,downloadUrl,videoUrl,tags,theme,gallery\nMinecraft,Adventure,https://example.com/img.jpg,Best game ever,https://download.com,,Survival|Multiplayer,dark,https://img1.jpg|https://img2.jpg",
    blogs: "title,summary,content,imageUrl,category,author,rating,affiliateUrl\nBest Keyboards,Review of keyboards,<p>Great keyboards...</p>,https://img.jpg,Hardware,Admin,4.8,https://amazon.com",
    products: "name,price,description,imageUrl,category,url,gallery\nGaming Mouse,49.99,High DPI mouse,https://img.jpg,Accessories,https://amazon.com,https://img1.jpg"
};

type TabType = 'games' | 'blogs' | 'products' | 'social-links' | 'comments' | 'ads' | 'settings' | 'analytics' | 'categories';

interface PaginationState { totalItems: number; totalPages: number; currentPage: number; itemsPerPage: number; }
interface AdminStats { totalGames: number; totalBlogs: number; totalProducts: number; gameCategories: number; blogCategories: number; productCategories: number; totalSocialLinks: number; totalComments: number; totalAds: number; }
interface TopItem { name: string; slug: string; view_count: number; }
interface AnalyticsData { topGames: TopItem[]; topBlogs: TopItem[]; topProducts: TopItem[]; }

const TopContentList = ({title, items, type}: {title: string, items: TopItem[], type: 'games' | 'blogs' | 'products'}) => {
    const maxViews = Math.max(...items.map(item => item.view_count), 1);
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            {items.length === 0 ? <p className="text-gray-400 text-sm">Pas encore de vues.</p> : (
                <ol className="space-y-3">
                    {items.map((item, index) => (
                        <li key={item.slug} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <a href={`/${type}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-purple-400 transition-colors truncate pr-4">{index + 1}. {item.name}</a>
                                <span className="font-bold text-gray-300">{item.view_count.toLocaleString()} vues</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full">
                                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${(item.view_count / maxViews) * 100}%` }}></div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

const AnalyticsPanel = ({ loading, data }: { loading: boolean; data: AnalyticsData | null }) => {
    if (loading) return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse"><div className="bg-gray-800 rounded-lg h-64"></div><div className="bg-gray-800 rounded-lg h-64"></div><div className="bg-gray-800 rounded-lg h-64"></div></div>;
    if (!data) return <div className="text-center py-10 text-gray-400">Aucune donnée d'analyse disponible.</div>;
    return (
      <div className="space-y-8">
          <h2 className="text-2xl font-bold">Analyse du Site</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopContentList title="Jeux les Plus Vus" items={data.topGames} type="games" />
              <TopContentList title="Blogs les Plus Lus" items={data.topBlogs} type="blogs" />
              <TopContentList title="Produits les Plus Populaires" items={data.topProducts} type="products" />
          </div>
      </div>
    );
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ads, setAds] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  const [categories, setCategories] = useState<CategorySetting[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'games' | 'blogs' | 'products'>('games');
  
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [previewModes, setPreviewModes] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const fetchDataForTab = useCallback(async (tab: TabType, page: number, search: string, sortKey: string, sortDir: string) => {
    if (['ads', 'settings', 'analytics', 'categories'].includes(tab)) return;
    setLoading(true);
    try {
        const url = `${API_BASE}/api/admin/${tab}?page=${page}&search=${encodeURIComponent(search)}&limit=${pagination.itemsPerPage}&sortBy=${sortKey}&sortOrder=${sortDir}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setItems(data.items);
            setPagination(data.pagination);
        }
    } catch (error) { addToast(`Erreur chargement ${tab}.`, 'error'); } finally { setLoading(false); }
  }, [addToast, pagination.itemsPerPage]);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/api/admin/analytics`);
        if (res.ok) setAnalyticsData(await res.json());
    } catch (error) { addToast('Erreur analytics.', 'error'); } finally { setLoading(false); }
  }, [addToast]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/api/admin/categories`);
        if (res.ok) setCategories(await res.json());
    } catch (error) { addToast('Erreur catégories.', 'error'); } finally { setLoading(false); }
  }, [addToast]);

  const fetchInitialAdminData = useCallback(async () => {
    try {
        const [statsRes, adsRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE}/api/admin/stats`),
            fetch(`${API_BASE}/api/admin/ads`),
            fetch(`${API_BASE}/api/admin/settings`),
        ]);
        if (statsRes.ok && adsRes.ok && settingsRes.ok) {
            setStats(await statsRes.json());
            const adsData = await adsRes.json();
            const adsObject = adsData.reduce((acc: any, ad: any) => ({ ...acc, [ad.placement]: ad.code || '' }), {});
            setAds(adsObject);
            setSettings(await settingsRes.json());
        }
    } catch (error) { console.error('Init data error', error); }
  }, []);

  const refreshCurrentTab = useCallback(() => {
    if (activeTab === 'analytics') fetchAnalyticsData();
    else if (activeTab === 'categories') fetchCategories();
    else fetchDataForTab(activeTab, currentPage, debouncedSearchQuery, sortConfig.key, sortConfig.direction);
    fetchInitialAdminData();
  }, [activeTab, currentPage, debouncedSearchQuery, sortConfig, fetchDataForTab, fetchInitialAdminData, fetchCategories, fetchAnalyticsData]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/check`);
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) { setIsAuthenticated(false); }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchInitialAdminData().finally(() => setLoading(false));
    }
  }, [isAuthenticated, fetchInitialAdminData]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'analytics') fetchAnalyticsData();
      else if (activeTab === 'categories') fetchCategories();
      else fetchDataForTab(activeTab, currentPage, debouncedSearchQuery, sortConfig.key, sortConfig.direction);
    }
  }, [isAuthenticated, activeTab, currentPage, debouncedSearchQuery, sortConfig, fetchDataForTab, fetchAnalyticsData, fetchCategories]);

  const handleSubmit = async (formData: any) => {
      const csrfToken = getCookie('csrf_token');
      if (!csrfToken) return addToast('Session expirée', 'error');
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(`${API_BASE}/api/admin/${activeTab}`, { 
          method, 
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, 
          body: JSON.stringify(formData) 
      });
      if (res.ok) { 
          addToast('Sauvegardé avec succès ! Revalidation en cours...', 'success'); 
          setShowForm(false); 
          setEditingItem(null); 
          // Force a small delay to allow DB/ISR to stabilize before refresh
          setTimeout(() => refreshCurrentTab(), 500);
      } else { 
          const err = await res.json();
          addToast(err.error || 'Erreur lors de la sauvegarde', 'error'); 
      }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    setIsAuthenticated(false);
  };

  const requestSort = (key: string) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });
  };

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-sans">Chargement de la session...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
        {/* FIX: Using explicit children prop for Head to resolve type errors in strict environments. */}
        <Head children={<title>Admin Login</title>} />
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/5">
          <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h1 className="text-2xl font-black uppercase tracking-tighter">Terminal Admin</h1>
             <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">G2gaming Core v2.0</p>
          </div>
          <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              try {
                const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
                const data = await res.json();
                if (res.ok && data.success) { setIsAuthenticated(true); setPassword(''); } else { setLoginError(data.message || 'Mot de passe incorrect'); }
              } catch (error) { setLoginError('Erreur de connexion'); }
          }} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-900/50 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" required placeholder="Access Code" />
            {loginError && <div className="text-red-400 text-xs font-bold bg-red-900/20 p-2 rounded border border-red-900/50">{loginError}</div>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all transform active:scale-95 shadow-lg shadow-purple-900/20">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ label, columnKey, className }: { label: string; columnKey: string; className?: string }) => (
      <th onClick={() => requestSort(columnKey)} className={`text-left p-4 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-purple-400 transition-colors ${className}`}>
        <div className="flex items-center gap-1">
            {label}
            <span className="text-purple-600 opacity-50">{sortConfig.key === columnKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>
        </div>
      </th>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-purple-500">
        {/* FIX: Using explicit children prop for Head to resolve type errors in strict environments. */}
        <Head children={<title>Control Center - G2gaming</title>} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {showForm && activeTab !== 'comments' && <AdminForm item={editingItem as FormItem | null} type={activeTab as FormItemType} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />}

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Control Center</h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">System Administration Hub</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a href="/" target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-white/5 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Live Site
                    </a>
                    <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-red-500/20 transition-all">Logout</button>
                </div>
            </header>

            <AdminDashboard stats={stats} />
            
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
              {['analytics', 'games', 'blogs', 'products', 'categories', 'social-links', 'comments', 'ads', 'settings'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as TabType)} 
                  className={`
                    px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border
                    ${activeTab === tab 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                        : 'bg-gray-800/50 border-white/5 text-gray-500 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="animate-fade-in">
                {activeTab === 'analytics' && <AnalyticsPanel loading={loading} data={analyticsData} />}
                {/* ... other tab components remain same logic ... */}
                {['games', 'blogs', 'products', 'social-links', 'comments'].includes(activeTab) && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                            <div className="relative flex-1 max-w-xl">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-xl border border-white/5 outline-none focus:border-purple-500/50 text-sm transition-all" />
                            </div>
                            <div className="flex gap-3 h-full">
                                {activeTab !== 'comments' && (
                                    <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-green-900/20">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        Add New
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fetching Secure Data...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-900/50 border-b border-white/5">
                                                <SortableHeader label="ID" columnKey="id" className="w-20" />
                                                <SortableHeader label="Name / Title" columnKey="title" />
                                                <SortableHeader label="Category" columnKey="category" className="hidden md:table-cell" />
                                                <SortableHeader label="Views" columnKey="view_count" className="w-32" />
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {items.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-4 text-xs font-mono text-gray-500">#{item.id}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 flex-shrink-0 overflow-hidden relative">
                                                                {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">NA</div>}
                                                            </div>
                                                            <span className="font-bold text-white group-hover:text-purple-400 transition-colors truncate max-w-xs">{item.title || item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell">
                                                        <span className="px-3 py-1 bg-gray-900 rounded-full text-[10px] font-black uppercase tracking-tighter text-gray-400 border border-white/5">{item.category}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                            <span className="text-xs font-bold text-gray-300">{item.view_count?.toLocaleString() || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="p-2.5 bg-gray-700 hover:bg-purple-600 text-white rounded-lg transition-all transform active:scale-90" title="Edit">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button onClick={async () => {
                                                                if(!confirm('Delete Permanently?')) return;
                                                                const csrfToken = getCookie('csrf_token');
                                                                await fetch(`${API_BASE}/api/admin/${activeTab}?id=${item.id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': csrfToken || '' } });
                                                                refreshCurrentTab();
                                                            }} className="p-2.5 bg-gray-700 hover:bg-red-600 text-white rounded-lg transition-all transform active:scale-90" title="Delete">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {items.length === 0 && (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4 text-gray-700">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Database Empty / No Results</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
