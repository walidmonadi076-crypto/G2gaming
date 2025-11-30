
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
    <section className="mb-12 animate-fade-in relative z-10">
      <div className="flex justify-between items-end mb-6 px-2 sm:px-4">
        <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                {title}
            </h2>
        </div>
        {viewMore && (
            <button 
                onClick={onViewMore} 
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-800/50 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
            >
                <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">View All</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
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
        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-16 bg-gray-900 animate-pulse border border-gray-800 mx-auto max-w-[1400px]">
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <div className="h-12 w-3/4 bg-gray-800 rounded-lg mb-6"></div>
            <div className="h-6 w-1/2 bg-gray-800 rounded-lg mb-8"></div>
            <div className="h-14 w-48 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      );
    }
    
    return (
        <div className="relative h-[450px] w-full rounded-[2rem] overflow-hidden mb-20 shadow-2xl group border border-white/5 mx-auto max-w-[1400px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-4xl">
                <div className="space-y-6 animate-fade-in-right">
                    <h2 
                        className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" 
                        dangerouslySetInnerHTML={{ __html: settings.hero_title }} 
                    />
                    <p className="text-xl md:text-2xl text-gray-300 font-medium drop-shadow-md max-w-2xl border-l-4 border-purple-500 pl-6">
                        {settings.hero_subtitle}
                    </p>
                    <div className="pt-4">
                        <button 
                            onClick={() => router.push(settings.hero_button_url)} 
                            className="group relative bg-white text-[#0d0d0d] font-black py-4 px-10 text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
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
      if (isLoading) {
          return <div className="bg-gray-900 animate-pulse rounded-2xl h-32 my-16 max-w-[1400px] mx-auto"></div>;
      }

      if (settings.promo_enabled) {
          return (
              <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 my-20 shadow-[0_0_40px_rgba(147,51,234,0.3)] max-w-[1400px] mx-auto group">
                  <div className="relative bg-[#121212] rounded-[1.4rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                      
                      {/* Background Effects */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/30 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/30 transition-colors" />

                      <div className="flex items-center space-x-6 relative z-10">
                          <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                              <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          </div>
                          <div>
                              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">{settings.promo_text}</h3>
                              <p className="text-gray-400 font-medium">Join the action and claim your rewards today!</p>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => router.push(settings.promo_button_url)} 
                        className="relative z-10 bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-8 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 whitespace-nowrap"
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
            {renderPromo()}
            
            <div className="space-y-8">
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
