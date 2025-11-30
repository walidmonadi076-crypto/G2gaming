import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { Product } from '../../types';
import { getAllProducts } from '../../lib/data';
import StoreItemCard from '../../components/StoreItemCard';
import FilterButton from '../../components/FilterButton';

interface ShopProps {
  searchQuery: string;
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ searchQuery, products }) => {
  const router = useRouter();
  const selectedCategory = (router.query.category as string) || 'All';

  // Extract unique categories
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  
  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });
  }, [products, selectedCategory, searchQuery]);
  
  const handleCategorySelect = (cat: string) => {
    const newQuery = { ...router.query };
    if (cat === 'All' || cat === selectedCategory) {
        delete newQuery.category;
    } else {
        newQuery.category = cat;
    }
    router.push({ pathname: '/shop', query: newQuery }, undefined, { shallow: true });
  };
  
  const areFiltersActive = searchQuery || (selectedCategory && selectedCategory !== 'All');

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-green-500 selection:text-white">
        {/* --- Page Header --- */}
        <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-3/4 h-64 bg-green-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-2 uppercase leading-[0.8]">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">Store</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-bold uppercase tracking-widest mt-6 max-w-xl flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-blue-500 inline-block"></span>
                        Gear . Merch . Upgrades
                    </p>
                </div>
            </div>

            {/* --- Filter & Search Bar --- */}
            <div className="sticky top-20 z-30 bg-[#0d0d0d]/80 backdrop-blur-xl border-y border-white/5 py-4 -mx-4 px-4 sm:px-0 sm:mx-0 sm:border-0 sm:mb-12">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    
                    {/* Categories Scrollable Area */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 hidden lg:block shrink-0">Collections //</span>
                        {categories.map(cat => (
                            <FilterButton 
                                key={cat} 
                                label={cat} 
                                isActive={selectedCategory === cat} 
                                onClick={() => handleCategorySelect(cat)} 
                            />
                        ))}
                    </div>

                    {/* Filter Status */}
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
                        {areFiltersActive ? (
                            <span>Found <span className="text-green-400">{filteredProducts.length}</span> items</span>
                        ) : (
                            <span>Inventory: <span className="text-white">{products.length}</span> items</span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Product Grid --- */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                    {filteredProducts.map(product => (
                        <StoreItemCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/50">
                    <div className="bg-gray-800 p-6 rounded-full mb-6 ring-4 ring-gray-800/50">
                        <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-black uppercase text-white mb-2 tracking-tight">Out of Stock</h3>
                    <p className="text-gray-400 font-medium max-w-md mb-8">
                        No products found matching "{searchQuery}" or the selected category.
                    </p>
                    <button 
                        onClick={() => router.push('/shop')}
                        className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm skew-x-[-10deg] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1"
                    >
                        <span className="block skew-x-[10deg]">Reset Store</span>
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
    const products = await getAllProducts();
    return {
        props: {
            products,
        },
        revalidate: 60,
    };
};

export default Shop;