import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.591-1.591a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.836 17.836a.75.75 0 01-1.06 0l-1.591-1.591a.75.75 0 111.06-1.06l1.591 1.591a.75.75 0 010 1.06zM12 21a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21A.75.75 0 0112 21zM7.664 17.836a.75.75 0 01-1.06-1.06l1.591-1.591a.75.75 0 111.06 1.06l-1.591 1.591zM4.5 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM6.106 6.106a.75.75 0 011.06 0l1.591 1.591a.75.75 0 11-1.06 1.06L6.106 7.168a.75.75 0 010-1.06z" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
    </svg>
);

const PaletteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props} aria-hidden="true">
    <path d="M12.378 1.602a.75.75 0 00-.756 0L3.022 6.072a.75.75 0 00-.456.673v10.5a.75.75 0 00.456.673l8.602 4.47a.75.75 0 00.756 0l8.602-4.47a.75.75 0 00.456-.673v-10.5a.75.75 0 00-.456-.673L12.378 1.602zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
  </svg>
);

const themes = [
  { name: 'dark', label: 'Dark', colors: ['#0b0f14', '#1f2937', '#E6EEF5', '#7c3aed'] },
  { name: 'light', label: 'Light', colors: ['#FAFAFB', '#FFFFFF', '#0f1720', '#4f46e5'] },
  { name: 'soft-accent', label: 'Soft Accent', colors: ['#0b1020', '#1e293b', '#E8F0FF', '#06b6d4'] },
  { name: 'gentle-warm', label: 'Gentle Warm', colors: ['#1c1917', '#292524', '#fff8ed', '#f59e0b'] },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();

  if (!theme) return null; // Avoid rendering on SSR or before hydration

  return (
    <div className="flex items-center gap-2">
       <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-alt transition-colors"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
       >
        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
       </button>
      
      <Popover className="relative">
        <Popover.Button className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-alt transition-colors" aria-label="Select a theme preset">
          <PaletteIcon className="w-5 h-5" />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-border ring-opacity-5 focus:outline-none p-2">
            <div className="space-y-1">
              {themes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setTheme(preset.name as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-text ${
                    theme === preset.name ? 'bg-accent text-white font-semibold' : 'hover:bg-surface-alt'
                  }`}
                  aria-pressed={theme === preset.name}
                >
                  <span>{preset.label}</span>
                  <div className="flex -space-x-1">
                    {preset.colors.map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border-2 border-surface"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
};

export default ThemeSwitcher;
