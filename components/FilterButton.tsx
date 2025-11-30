import React from 'react';

interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            relative px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-sm transition-all duration-300 border skew-x-[-10deg] overflow-hidden group
            ${isActive 
                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)] scale-105' 
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white hover:bg-gray-800'
            }
        `}
    >
        {/* Shine Effect */}
        <div className={`absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 ${isActive ? 'opacity-20' : 'opacity-0'}`} />
        
        <span className="block skew-x-[10deg] relative z-20">{label}</span>
    </button>
);

export default FilterButton;