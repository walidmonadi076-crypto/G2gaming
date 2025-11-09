import React from 'react';
import type { GetStaticProps } from 'next';
import type { Game } from '../types';
import { getAllGames } from '../lib/data';
import GameCarousel from '../components/GameCarousel';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>
      {children}
    </section>
);

interface HomeProps {
    games: Game[];
}

const Home: React.FC<HomeProps> = ({ games }) => {
  const topGames = games.filter(g => g.tags?.includes('Top'));
  const featuredGames = games.filter(g => g.tags?.includes('Play on Comet'));
  const newGames = games.filter(g => g.tags?.includes('New'));
  const hotGames = games.filter(g => g.tags?.includes('Hot'));

  return (
    <div className="space-y-4">
      {topGames.length > 0 && (
        <Section title="Top Games">
          <GameCarousel games={topGames} />
        </Section>
      )}
      {featuredGames.length > 0 && (
        <Section title="Featured Games">
          <GameCarousel games={featuredGames} cardVariant="featured" />
        </Section>
      )}
       {newGames.length > 0 && (
        <Section title="New Games">
          <GameCarousel games={newGames} />
        </Section>
      )}
       {hotGames.length > 0 && (
        <Section title="Hot Games">
          <GameCarousel games={hotGames} />
        </Section>
      )}
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
