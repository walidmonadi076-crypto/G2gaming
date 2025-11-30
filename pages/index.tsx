
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Game, SiteSettings } from '../types';
import { getAllGames, getSiteSettings } from '../lib/data';
import GameCarousel from '../components/GameCarousel';
import Image from 'next/image';
import { useSettings } from '../contexts/AdContext';

const Section: React.FC<{ title: string; children: React.ReactNode, viewMore?: boolean, onViewMore?: () => void }> = ({ title, children, viewMore = true, onViewMore }) => (
    <section className="mb-16 lg:mb-20 animate-fade-in">
      <div className="flex justify-between items-end mb-6 px-1">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
        {viewMore && (
            <button 
                onClick={onViewMore} 
                className="text-sm font-semibold text-purple-400 hover:text-white transition-colors flex items-center group"
            >
                View all 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
          // Switch back to 'default' (horizontal) as requested by user ("ofo9iyin")
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
        <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden mb-16 bg-gray-800 animate-pulse border border-gray-700">
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <div className="h-12 w-3/4 bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-6 w-1/2 bg-gray-700 rounded-lg mb-8"></div>
            <div className="h-14 w-48 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      );
    }
    
    return (
        <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden mb-16 shadow-2xl group">
            <Image 
                src={settings.hero_bg_url} 
                alt="Welcome banner" 
                fill 
                sizes="100vw" 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent p-8 md:p-16 flex flex-col justify-center">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg mb-4 max-w-2xl" dangerouslySetInnerHTML={{ __html: settings.hero_title }} />
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl font-medium drop-shadow-md">{settings.hero_subtitle}</p>
                <button 
                    onClick={() => router.push(settings.hero_button_url)} 
                    className="bg-purple-600 text-white font-bold py-3 px-8 text-lg rounded-xl w-fit hover:bg-purple-700 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
                >
                    {settings.hero_button_text}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
  };

  const renderPromo = () => {
      if (isLoading) {
          return <div className="bg-gray-800 animate-pulse rounded-2xl h-24 my-16"></div>;
      }

      if (settings.promo_enabled) {
          return (
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 my-16 shadow-xl border border-purple-500/20">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                  
                  <div className="flex items-center space-x-6 relative z-10">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-inner">
                          <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      </div>
                      <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{settings.promo_text}</h3>
                          <p className="text-purple-200 text-sm">Join the action and claim your rewards today!</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => router.push(settings.promo_button_url)} 
                    className="relative z-10 bg-white text-purple-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap"
                  >
                    {settings.promo_button_text}
                  </button>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="space-y-4 pb-12">
        {renderHero()}
        {renderPromo()}
        
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
