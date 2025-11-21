import React, { useState, useEffect, useRef } from 'react';
import { GameState, HexCell, TerrainType, SpeciesType } from '../types';
import { WEATHER_EFFECTS, TERRAIN_CONFIG } from '../constants';
import { Battery, CloudRain, Sun, Cloud, Flower, Skull, Home, Droplets, HelpCircle, GripHorizontal, LogOut } from 'lucide-react';

interface Props {
  gameState: GameState;
  currentHex: HexCell | undefined;
  onForage: () => void;
  onRest: () => void;
  onOpenHelp: () => void;
  onExit: () => void;
}

export const HUD: React.FC<Props> = ({ gameState, currentHex, onForage, onRest, onOpenHelp, onExit }) => {
  // Action Panel Drag State
  const [actionPos, setActionPos] = useState({ x: 0, y: 0 });
  const [isDraggingAction, setIsDraggingAction] = useState(false);
  const actionDragOffset = useRef({ x: 0, y: 0 });
  const actionInitialized = useRef(false);

  // Weather Panel Drag State
  const [weatherPos, setWeatherPos] = useState({ x: 0, y: 0 });
  const [isDraggingWeather, setIsDraggingWeather] = useState(false);
  const weatherDragOffset = useRef({ x: 0, y: 0 });
  const weatherInitialized = useRef(false);

  // Init Action Panel (Bottom Left)
  useEffect(() => {
    if (!actionInitialized.current) {
      // Start near bottom-left, avoiding overlap with edge but clear of center
      setActionPos({ x: 20, y: window.innerHeight - 320 });
      actionInitialized.current = true;
    }
  }, []);

  // Init Weather Panel (Top Center)
  useEffect(() => {
    if (!weatherInitialized.current) {
      setWeatherPos({ x: (window.innerWidth / 2) - 100, y: 16 });
      weatherInitialized.current = true;
    }
  }, []);

  // Mouse Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingAction) {
        setActionPos({
          x: e.clientX - actionDragOffset.current.x,
          y: e.clientY - actionDragOffset.current.y
        });
      }
      if (isDraggingWeather) {
        setWeatherPos({
          x: e.clientX - weatherDragOffset.current.x,
          y: e.clientY - weatherDragOffset.current.y
        });
      }
    };
    const handleMouseUp = () => {
      setIsDraggingAction(false);
      setIsDraggingWeather(false);
    };

    if (isDraggingAction || isDraggingWeather) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingAction, isDraggingWeather]);


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
    <>
      {/* Fixed Stats Panel (Top Left) */}
      <div className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl flex flex-col gap-3 min-w-[220px] pointer-events-auto">
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

          {/* Collected Resource */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2">
                  <ResourceIcon className={`w-5 h-5 ${resourceColor}`} />
                  <span className="text-sm text-slate-300">{resourceLabel}</span>
              </div>
              <span className={`font-mono font-bold ${resourceValueColor}`}>{player.pollen}</span>
          </div>
      </div>

      {/* Fixed Buttons (Top Right) */}
      <div className="absolute top-4 right-4 z-40 flex gap-2 pointer-events-auto">
          <button 
              onClick={onOpenHelp}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 p-2 rounded-full shadow-lg transition-all"
              title="Field Guide / Help"
          >
              <HelpCircle className="w-6 h-6" />
          </button>
          <button 
              onClick={onExit}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-red-400 hover:text-red-300 p-2 rounded-full shadow-lg transition-all"
              title="Exit Simulation"
          >
              <LogOut className="w-6 h-6" />
          </button>
      </div>

      {/* Draggable Weather Panel */}
      <div 
        className="fixed z-50 pointer-events-auto bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl shadow-xl overflow-hidden w-[200px]"
        style={{ left: weatherPos.x, top: weatherPos.y }}
      >
          {/* Drag Handle */}
          <div 
            className="bg-slate-800 p-1 flex justify-center cursor-move hover:bg-slate-700 transition-colors"
            onMouseDown={(e) => {
                setIsDraggingWeather(true);
                weatherDragOffset.current = { x: e.clientX - weatherPos.x, y: e.clientY - weatherPos.y };
            }}
          >
              <GripHorizontal className="w-4 h-4 text-slate-500" />
          </div>
          
          <div className="px-6 py-3 flex flex-col items-center">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Day {day} / 15</div>
              <div className="flex items-center gap-3">
                  <WeatherIcon className="w-8 h-8 text-amber-300" />
                  <span className="font-bold text-xl">{weather}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 text-center leading-tight">{weatherInfo.desc}</p>
          </div>
      </div>

      {/* Draggable Action Panel */}
      <div 
        className="fixed z-50 flex flex-col gap-2 pointer-events-auto"
        style={{ left: actionPos.x, top: actionPos.y }}
      >
          {/* Contextual Hex Info Box */}
          <div className="bg-slate-900/95 backdrop-blur border border-slate-600 rounded-lg shadow-2xl w-72 overflow-hidden">
             {/* Drag Handle */}
            <div 
              className="bg-slate-800 p-1 flex justify-center cursor-move hover:bg-slate-700 transition-colors"
              onMouseDown={(e) => {
                  setIsDraggingAction(true);
                  actionDragOffset.current = { x: e.clientX - actionPos.x, y: e.clientY - actionPos.y };
              }}
            >
               <GripHorizontal className="w-4 h-4 text-slate-500" />
            </div>
            
            <div className="p-4 pt-2">
              <h4 className="font-bold text-slate-200 border-b border-slate-600 pb-2 mb-2 flex items-center justify-between">
                  {terrainInfo.label}
                  {currentHex.type === TerrainType.NEST && <Home className="w-4 h-4 text-emerald-400"/>}
              </h4>
              <div className="space-y-1 text-sm">
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
                    <span className="font-mono text-amber-200">{currentHex.resourceQuality}%</span>
                  </div>
              </div>

              {/* Buttons Inside the Panel */}
              <div className="mt-4 flex gap-2">
                  {currentHex.type === TerrainType.NEST ? (
                      <button 
                        onClick={onRest}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all flex flex-col items-center justify-center"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5" />
                          <span>End Day</span>
                        </div>
                      </button>
                  ) : (
                      <>
                          <button 
                              onClick={onForage}
                              disabled={!canForage}
                              className={`flex-1 font-bold py-3 rounded-lg shadow-lg transform transition-all flex flex-col items-center justify-center
                                  ${canForage 
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 hover:scale-105' 
                                      : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'}
                              `}
                          >
                              <div className="flex items-center gap-2">
                                {isHoverfly ? <Droplets className="w-5 h-5" /> : <Flower className="w-5 h-5" />}
                                <span>{isHoverfly ? "Feed" : "Forage"}</span>
                              </div>
                          </button>
                          
                          <button 
                              onClick={onRest}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg shadow-lg flex flex-col items-center justify-center"
                              title="Rest/Recover (Small energy gain)"
                          >
                              <div className="flex items-center gap-2">
                                <Battery className="w-5 h-5" />
                                <span>Rest</span>
                              </div>
                          </button>
                      </>
                  )}
              </div>
            </div>
          </div>
      </div>
    </>
  );
}