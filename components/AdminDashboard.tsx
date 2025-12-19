
import { useEffect, useState } from 'react';

interface AdminStats {
  totalGames: number;
  totalBlogs: number;
  totalProducts: number;
  gameCategories: number;
  blogCategories: number;
  productCategories: number;
  totalSocialLinks: number;
  totalComments: number;
  totalAds: number;
}

interface AdminDashboardProps {
  stats: AdminStats | null;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  if (!stats) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="bg-gray-800 h-32 rounded-3xl border border-white/5"></div>)}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Gaming Hub"
        value={stats.totalGames}
        subtitle={`${stats.gameCategories} Categories`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
        color="purple"
      />
      <StatCard
        title="Journalist"
        value={stats.totalBlogs}
        subtitle={`${stats.totalComments} Comments`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-1 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1-5h.01" /></svg>}
        color="blue"
      />
      <StatCard
        title="Inventory"
        value={stats.totalProducts}
        subtitle="Active Gear"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        color="green"
      />
      <StatCard
        title="Connections"
        value={stats.totalSocialLinks}
        subtitle="Social Channels"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
        color="orange"
      />
    </div>
  );
}

type ColorType = 'purple' | 'blue' | 'green' | 'orange';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: ColorType;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses: Record<ColorType, string> = {
    purple: 'from-purple-600 to-purple-800 shadow-purple-900/20',
    blue: 'from-blue-600 to-blue-800 shadow-blue-900/20',
    green: 'from-green-600 to-green-800 shadow-green-900/20',
    orange: 'from-orange-500 to-orange-700 shadow-orange-900/20',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-[2rem] p-6 shadow-xl border border-white/10 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
          <p className="text-4xl font-black text-white mb-1 tracking-tighter leading-none">{value.toLocaleString()}</p>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide">{subtitle}</p>
        </div>
        <div className="w-12 h-12 text-white opacity-20">
          {icon}
        </div>
      </div>
    </div>
  );
}
