
import type { Game } from '../types';

export const GAMES_DATA: Game[] = [
    // GTA 5 Mobile Entry - Platform Specific
    { 
      id: 99, 
      slug: 'gta-5-mobile', 
      title: 'GTA 5 Mobile', 
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/disc/2560/14/CUSA00419_00_2563385467462729.png', 
      category: 'Action', 
      platform: 'mobile', 
      tags: ['Hot', 'Open World', 'Mobile Exclusive'], 
      theme: 'dark', 
      description: 'Experience the open-world masterpiece Grand Theft Auto V on your mobile device. Explore the vast world of Los Santos and Blaine County in the ultimate mobile experience. Features optimized touch controls, enhanced graphics for high-end smartphones, and the full story mode campaign.', 
      videoUrl: '', 
      downloadUrl: '#', // Android Link
      downloadUrlIos: '#', // iOS Link
      gallery: [
        'https://prod-ripcut-delivery.disney-plus.net/v1/variant/disney/E3D7D7C8606277D5985055050302302302020202',
        'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/271590/ss_8e0292b379987a057262070f900000000.1920x1080.jpg'
      ],
      requirements: {
        os: 'Android 10.0+ / iOS 14.0+',
        ram: '4GB Minimum',
        storage: '8.5GB Free Space',
        processor: 'Snapdragon 845 / A12 Bionic or better'
      }
    },
    // Existing games
    { id: 1, slug: 'cubes-2048-io', title: 'Cubes 2048.io', imageUrl: 'https://picsum.photos/seed/1/400/500', category: 'Puzzle', platform: 'pc', tags: ['Play on Comet'], theme: 'colorful', description: 'A mind-bending puzzle game where you merge cubes to reach the 2048 tile.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g1a/800/600'] },
    { id: 2, slug: 'bit-gun', title: 'Bit Gun', imageUrl: 'https://picsum.photos/seed/2/400/500', category: 'Action', platform: 'pc', tags: ['Play on Comet'], theme: 'retro', description: 'A retro-style shooter with pixel art graphics.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g2a/800/600'] },
    { id: 3, slug: 'sky-riders', title: 'Sky Riders', imageUrl: 'https://picsum.photos/seed/3/400/500', category: 'Racing', platform: 'pc', tags: ['Hot', 'Play on Comet'], theme: 'light', description: 'Race through futuristic cityscapes in high-speed anti-gravity vehicles.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g3a/800/600'] },
    { id: 4, slug: 'tiny-fishing', title: 'Tiny Fishing', imageUrl: 'https://picsum.photos/seed/4/400/500', category: 'Sports', platform: 'pc', tags: ['Play on Comet'], theme: 'light', description: 'A relaxing and addictive fishing game.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g4a/800/600'] },
    { id: 5, slug: 'sandbox-city', title: 'Sandbox City', imageUrl: 'https://picsum.photos/seed/5/400/500', category: 'Adventure', platform: 'pc', tags: ['Play on Comet'], theme: 'dark', description: 'An open-world sandbox game where you can explore a vast city.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g5a/800/600'] },
    { id: 6, slug: 'growden-io', title: 'Growden.io', imageUrl: 'https://picsum.photos/seed/6/600/400', category: 'Strategy', platform: 'pc', theme: 'colorful', description: 'A multiplayer strategy game where you grow your territory.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g6a/800/600'] },
    { id: 7, slug: 'bloxd-io', title: 'Bloxd.io', imageUrl: 'https://picsum.photos/seed/7/600/400', category: 'Adventure', platform: 'pc', theme: 'retro', description: 'A block-based online game with various modes.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g7a/800/600'] },
    { id: 8, slug: 'hazmob-fps', title: 'Hazmob FPS', imageUrl: 'https://picsum.photos/seed/8/600/400', category: 'Action', platform: 'pc', theme: 'dark', description: 'A tactical first-person shooter.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g8a/800/600'] },
    { id: 9, slug: 'piece-of-cake', title: 'Piece of Cake', imageUrl: 'https://picsum.photos/seed/9/600/400', category: 'Puzzle', platform: 'pc', theme: 'light', description: 'A sweet and challenging puzzle game.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g9a/800/600'] },
    { id: 10, slug: 'smash-karts', title: 'Smash Karts', imageUrl: 'https://picsum.photos/seed/10/400/300', category: 'Racing', platform: 'pc', tags: ['Top'], theme: 'colorful', description: 'An action-packed kart racing game.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g10a/800/600'] },
    { id: 11, slug: 'dummy-swing', title: 'Dummy Swing', imageUrl: 'https://picsum.photos/seed/11/400/300', category: 'Puzzle', platform: 'pc', tags: ['Updated'], theme: 'light', description: 'A physics-based puzzle game.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g11a/800/600'] },
    { id: 12, slug: 'fish-orbit', title: 'Fish Orbit', imageUrl: 'https://picsum.photos/seed/12/400/300', category: 'Adventure', platform: 'pc', theme: 'dark', description: 'Explore the depths of space as a cosmic fish.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g12a/800/600'] },
    { id: 13, slug: 'caravels-online', title: 'Caravels Online', imageUrl: 'https://picsum.photos/seed/13/400/300', category: 'Strategy', platform: 'pc', tags: ['New'], theme: 'retro', description: 'A naval strategy game set in the age of sail.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g13a/800/600'] },
    { id: 14, slug: 'chain-reaction', title: 'Chain Reaction', imageUrl: 'https://picsum.photos/seed/14/400/300', category: 'Puzzle', platform: 'pc', tags: ['New'], theme: 'colorful', description: 'A minimalist puzzle game about setting off chain reactions.', downloadUrl: '#', gallery: ['https://picsum.photos/seed/g14a/800/600'] },
];
