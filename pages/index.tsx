
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Game, SiteSettings } from '../types';
import { getAllGames, getSiteSettings } from '../lib/data';
import GameCarousel from '../components/GameCarousel';
import Image from 'next/image';
import { useSettings } from '../contexts/AdContext';
import SEO from '../components/SEO';

const Section: React.FC<{ title: string; children: React.ReactNode, viewMore?: boolean, onViewMore?: () => void }> = ({ title, children, viewMore = true, onViewMore }) => (
    <section className="mb-8 animate-fade-in relative z-10">
      <div className="flex justify-between items-end mb-4 px-2 sm:px-4">
        <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none uppercase">
                {title}
            </h2>
        </div>
        {viewMore && (
            <button 
                onClick={onViewMore} 
                className="group flex items-center gap-1 px-3 py-1 rounded-md bg-gray-800/50 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
            >
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">View All</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
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
        <div className="relative h-[300px] w-full rounded-2xl overflow-hidden mb-12 bg-gray-900 animate-pulse border border-gray-800 mx-auto max-w-[1400px]">
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
            <div className="h-10 w-3/4 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-5 w-1/2 bg-gray-800 rounded-lg mb-6"></div>
            <div className="h-12 w-40 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      );
    }
    
    return (
        <div className="relative h-[350px] w-full rounded-2xl overflow-hidden mb-12 shadow-2xl group border border-white/5 mx-auto max-w-[1400px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-4xl">
                <div className="space-y-4 animate-fade-in-right">
                    <h2 
                        className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase" 
                        dangerouslySetInnerHTML={{ __html: settings.hero_title }} 
                    />
                    <p className="text-lg md:text-xl text-gray-300 font-medium drop-shadow-md max-w-2xl border-l-4 border-purple-500 pl-4">
                        {settings.hero_subtitle}
                    </p>
                    <div className="pt-4">
                        <button 
                            onClick={() => router.push(settings.hero_button_url)} 
                            className="group relative bg-white text-[#0d0d0d] font-black py-3 px-8 text-base rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] uppercase tracking-wide"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {settings.hero_button_text}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
      if (isLoading) {
          return <div className="bg-gray-900 animate-pulse rounded-xl h-24 my-10 max-w-[1400px] mx-auto"></div>;
      }

      if (settings.promo_enabled) {
          return (
              <div className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 my-12 shadow-[0_0_30px_rgba(147,51,234,0.25)] max-w-[1400px] mx-auto group">
                  <div className="relative bg-[#121212] rounded-[0.9rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                      
                      {/* Background Effects */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />

                      <div className="flex items-center space-x-5 relative z-10">
                          <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                              <svg className="w-7 h-7 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          </div>
                          <div>
                              <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">{settings.promo_text}</h3>
                              <p className="text-gray-400 text-sm font-medium">Join the action and claim your rewards today!</p>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => router.push(settings.promo_button_url)} 
                        className="relative z-10 bg-white hover:bg-gray-100 text-black font-bold py-2.5 px-6 rounded-lg transition-all hover:scale-105 hover:shadow-lg whitespace-nowrap text-sm uppercase tracking-wide"
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
            {renderHero()}
            {renderPromo()}
            
            <div className="space-y-6">
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
