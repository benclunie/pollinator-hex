import React from 'react';
import { GameState, HexCell, TerrainType, SpeciesType } from '../types';
import { WEATHER_EFFECTS, TERRAIN_CONFIG } from '../constants';
import { Battery, CloudRain, Sun, Cloud, Flower, Skull, Home, Droplets } from 'lucide-react';

interface Props {
  gameState: GameState;
  currentHex: HexCell | undefined;
  onForage: () => void;
  onRest: () => void;
}

export const HUD: React.FC<Props> = ({ gameState, currentHex, onForage, onRest }) => {
  if (!gameState.species || !currentHex) return null;

  const { player, weather, day, species } = gameState;
  const weatherInfo = WEATHER_EFFECTS[weather];
  
  const WeatherIcon = {
    'SUNNY': Sun,
    'RAINY': CloudRain,
    'CLOUDY': Cloud
  }[weather];

  const terrainInfo = TERRAIN_CONFIG[currentHex.type];
  const canForage = !currentHex.hasForagedToday && currentHex.type !== TerrainType.NEST && currentHex.type !== TerrainType.WATER && currentHex.type !== TerrainType.ROAD;

  // Dynamic Resource Display
  const isHoverfly = species.name === SpeciesType.HOVERFLY;
  const resourceLabel = isHoverfly ? "Nectar" : "Pollen (Store)";
  const ResourceIcon = isHoverfly ? Droplets : Flower;
  const resourceColor = isHoverfly ? "text-cyan-400" : "text-pink-400";
  const resourceValueColor = isHoverfly ? "text-cyan-200" : "text-pink-200";

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex flex-col pointer-events-none gap-4">
      {/* Top Bar */}
      <div className="flex justify-between items-start w-full max-w-6xl mx-auto">
        
        {/* Left: Stats */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl pointer-events-auto flex flex-col gap-3 min-w-[220px]">
            <h2 className="text-amber-400 font-bold text-lg uppercase tracking-wider">{species.name}</h2>
            
            {/* Energy Bar */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${player.energy < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`} />
                        <span className="text-xs text-slate-300">Energy</span>
                    </div>
                    <span className="font-mono text-xs font-bold">{player.energy.toFixed(0)} / {species.maxEnergy}</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${player.energy < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${(player.energy / species.maxEnergy) * 100}%` }}
                    />
                </div>
            </div>

            {/* Toxicity Bar */}
             <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Skull className={`w-4 h-4 ${player.toxicity > species.maxToxicity * 0.8 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`} />
                        <span className="text-xs text-slate-300">Toxicity</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-200">{player.toxicity.toFixed(0)} / {species.maxToxicity}</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${player.toxicity > species.maxToxicity * 0.8 ? 'bg-red-500' : 'bg-purple-500'}`} 
                        style={{ width: `${Math.min(100, (player.toxicity / species.maxToxicity) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Collected Resource (Pollen or Nectar/Eggs) */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2">
                    <ResourceIcon className={`w-5 h-5 ${resourceColor}`} />
                    <span className="text-sm text-slate-300">{resourceLabel}</span>
                </div>
                <span className={`font-mono font-bold ${resourceValueColor}`}>{player.pollen}</span>
            </div>
        </div>

        {/* Center: Day/Weather */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-6 py-3 rounded-xl shadow-xl pointer-events-auto flex flex-col items-center">
             <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Day {day} / 15</div>
             <div className="flex items-center gap-3">
                <WeatherIcon className="w-8 h-8 text-amber-300" />
                <span className="font-bold text-xl">{weather}</span>
             </div>
             <p className="text-xs text-slate-400 mt-1 max-w-[150px] text-center">{weatherInfo.desc}</p>
        </div>
      </div>

      {/* Bottom Center: Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-4 pointer-events-auto z-50">
          
          {/* Contextual Hex Info */}
          <div className="bg-slate-800/95 backdrop-blur border border-slate-600 p-4 rounded-lg shadow-2xl w-64 text-sm hidden md:block">
            <h4 className="font-bold text-slate-200 border-b border-slate-600 pb-2 mb-2 flex items-center justify-between">
                {terrainInfo.label}
                {currentHex.type === TerrainType.NEST && <Home className="w-4 h-4 text-emerald-400"/>}
            </h4>
            <div className="space-y-1">
                <div className="flex justify-between"><span className="text-slate-400">Risk:</span> <span className="text-red-300">{terrainInfo.risk}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Resources:</span> <span className="text-emerald-300">{terrainInfo.resources}</span></div>
                {currentHex.pesticideLevel > 0 && (
                     <div className="flex justify-between text-xs text-purple-400 font-bold mt-1">
                        <span>Toxicity:</span>
                        <span>{(currentHex.pesticideLevel * 100).toFixed(0)}%</span>
                     </div>
                )}
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                   <span className="text-slate-400">Quality:</span> 
                   <span className="font-mono">{currentHex.resourceQuality}%</span>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
             {currentHex.type === TerrainType.NEST ? (
                 <button 
                 onClick={onRest}
                 className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all flex flex-col items-center"
               >
                 <Home className="w-6 h-6 mb-1" />
                 <span>End Day (Rest)</span>
               </button>
             ) : (
                 <>
                     <button 
                        onClick={onForage}
                        disabled={!canForage}
                        className={`font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all flex flex-col items-center min-w-[120px]
                            ${canForage 
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 hover:scale-105' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'}
                        `}
                    >
                        {isHoverfly ? <Droplets className="w-6 h-6 mb-1" /> : <Flower className="w-6 h-6 mb-1" />}
                        <span>{isHoverfly ? "Feed" : "Forage"}</span>
                    </button>
                    
                    <button 
                        onClick={onRest}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-6 rounded-lg shadow-lg flex flex-col items-center"
                    >
                        <Battery className="w-6 h-6 mb-1" />
                        <span>Wait</span>
                    </button>
                 </>
             )}
          </div>

      </div>
    </div>
  );
};