import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Game, SiteSettings } from '../types';
import { getAllGames, getSiteSettings } from '../lib/data';
import GameCarousel from '../components/GameCarousel';
import Image from 'next/image';
import { useSettings } from '../contexts/AdContext';
import SEO from '../components/SEO';
import QuestBanner from '../components/QuestBanner';
import Ad from '../components/Ad';

const Section: React.FC<{ title: string; children: React.ReactNode, viewMore?: boolean, onViewMore?: () => void }> = ({ title, children, viewMore = true, onViewMore }) => (
    <section className="mb-16 animate-fade-in relative z-10">
      <div className="flex justify-between items-end mb-6 px-2 sm:px-4">
        <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none uppercase drop-shadow-md">
                {title}
            </h2>
        </div>
        {viewMore && (
            <button 
                onClick={onViewMore} 
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
                <span className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest">View All</span>
                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
            </button>
        )}
      </div>
      {children}
    </section>
);

interface HomeProps {
    games: Game[];
}

const Home: React.FC<HomeProps> = ({ games }) => {
  const router = useRouter();
  const { settings, isLoading } = useSettings();

  const sections = useMemo(() => {
    const priorityOrder = ['Play on Comet', 'New', 'Hot', 'Updated', 'Top', 'Featured'];
    
    const tagsSet = new Set<string>();
    games.forEach(g => {
        if (g.tags && Array.isArray(g.tags)) {
            g.tags.forEach(t => tagsSet.add(t));
        }
    });
    const allTags = Array.from(tagsSet);
    
    const priorityTags = priorityOrder.filter(tag => allTags.includes(tag));
    const otherTags = allTags.filter(tag => !priorityOrder.includes(tag)).sort();
    const orderedTags = [...priorityTags, ...otherTags];

    return orderedTags
      .map(tag => {
        const sectionGames = games.filter(g => g.tags?.includes(tag));
        const title = tag === 'Play on Comet' ? 'Play on Comet' : `${tag} Games`;
        
        return {
          key: tag.toLowerCase().replace(/\s+/g, '-'),
          title: title,
          games: sectionGames,
          carouselProps: { cardVariant: 'default' as const },
          tag: tag,
        };
      })
      .filter(section => section.games.length > 0);
  }, [games]);

  const handleViewMore = (tag: string) => {
    router.push({
        pathname: '/games',
        query: { tags: tag }
    });
  };
  
  const renderHero = () => {
    if (isLoading) {
      return (
        <div className="relative h-[300px] w-full rounded-2xl overflow-hidden mb-12 bg-gray-900 animate-pulse border border-gray-800 mx-auto max-w-[1400px]"></div>
      );
    }
    
    return (
        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/5 mx-auto max-w-[1400px]">
            {/* Background Image with Zoom Effect */}
            <Image 
                src={settings.hero_bg_url} 
                alt="Welcome banner" 
                fill 
                sizes="100vw" 
                className="object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105" 
                priority 
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-4xl">
                <div className="space-y-6 animate-fade-in-right">
                    <h2 
                        className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter drop-shadow-2xl uppercase" 
                        dangerouslySetInnerHTML={{ __html: settings.hero_title }} 
                    />
                    <p className="text-xl text-gray-300 font-medium drop-shadow-md max-w-2xl border-l-4 border-purple-500 pl-6 py-1">
                        {settings.hero_subtitle}
                    </p>
                    <div className="pt-6">
                        <button 
                            onClick={() => router.push(settings.hero_button_url)} 
                            className="group relative bg-white text-[#0d0d0d] font-black py-4 px-10 text-lg rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] uppercase tracking-wide skew-x-[-5deg]"
                        >
                            <span className="relative z-10 flex items-center gap-3 skew-x-[5deg]">
                                {settings.hero_button_text}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderPromo = () => {
      if (!isLoading && settings.promo_enabled) {
          return (
              <div className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 mb-16 shadow-[0_0_30px_rgba(234,179,8,0.25)] max-w-[1400px] mx-auto group">
                  <div className="relative bg-[#121212] rounded-[0.9rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                      <div className="flex items-center space-x-5 relative z-10">
                          <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                              <svg className="w-8 h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          </div>
                          <div>
                              <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight uppercase">{settings.promo_text}</h3>
                              <p className="text-gray-400 text-sm font-medium">Limited time event. Join now!</p>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => router.push(settings.promo_button_url)} 
                        className="relative z-10 bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-lg transition-all hover:scale-105 hover:shadow-lg whitespace-nowrap text-sm uppercase tracking-wide"
                      >
                        {settings.promo_button_text}
                      </button>
                  </div>
              </div>
          );
      }
      return null;
  };

  return (
    <>
      <SEO />
      
      <div className="min-h-screen bg-[#0d0d0d] text-white selection:bg-purple-500 selection:text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
            
            {renderHero()}
            
            {/* Gamified Ad Banner - Placed strategically after Hero */}
            <QuestBanner />

            {renderPromo()}
            
            <div className="space-y-12">
                {sections.map(section => (
                    <Section 
                        key={section.key} 
                        title={section.title} 
                        onViewMore={() => handleViewMore(section.tag)}
                    >
                        <GameCarousel games={section.games} {...section.carouselProps} />
                    </Section>
                ))}
            </div>

            {/* Footer Partner Ad - High visibility exit placement */}
            <div className="mt-20 border-t border-white/5 pt-10">
                <div className="text-center mb-6">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Sponsored Partners</p>
                </div>
                <div className="flex justify-center">
                    <Ad placement="footer_partner" className="w-full max-w-[728px] bg-transparent shadow-none border-0" />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
    const games = await getAllGames();

    return {
        props: {
            games,
        },
        revalidate: 60,
    };
};

export default Home;