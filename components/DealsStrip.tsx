
import React from 'react';
import Ad from './Ad';

const DealsStrip: React.FC = () => {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden 2xl:flex flex-col gap-4 w-[140px]">
      <div className="text-center">
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
            Hot Deals
        </span>
      </div>
      
      {/* Container for the Deal Strip Ad */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-2 shadow-2xl transition-transform hover:-translate-x-1 duration-300">
         <Ad placement="deals_strip" className="w-[120px] min-h-[600px] bg-transparent border-0 shadow-none" showLabel={false} />
      </div>
    </div>
  );
};

export default DealsStrip;
