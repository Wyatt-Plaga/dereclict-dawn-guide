import React from 'react';
import { RegionType } from '@/app/game/types';

interface RegionEffectsProps {
  region: RegionType;
}

// Get background class based on region
const getRegionBackgroundClass = (region: RegionType): string => {
  switch (region) {
    case 'void':
      return 'bg-gradient-to-br from-slate-900 to-slate-800';
    case 'nebula':
      return 'bg-gradient-to-br from-indigo-900 to-purple-800';
    case 'asteroid':
      return 'bg-gradient-to-br from-stone-800 to-amber-900';
    case 'deepspace':
      return 'bg-gradient-to-br from-slate-950 to-blue-950';
    case 'blackhole':
      return 'bg-gradient-to-br from-zinc-950 to-slate-950';
    default:
      return 'bg-gradient-to-br from-slate-900 to-slate-800';
  }
};

const RegionEffects: React.FC<RegionEffectsProps> = ({ region }) => {
  const regionClass = getRegionBackgroundClass(region);
  
  return (
    <div className="absolute inset-0 -m-4 md:-m-8 z-0 overflow-hidden opacity-20">
      <div className={`${region === 'nebula' ? 'nebula-effect' : 
                   region === 'blackhole' ? 'blackhole-effect' : 
                   region === 'asteroid' ? 'asteroid-effect' : 
                   region === 'deepspace' ? 'deepspace-effect' : 'void-effect'}`}>
      </div>
    </div>
  );
};

export default RegionEffects; 