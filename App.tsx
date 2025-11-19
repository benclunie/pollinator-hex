import React, { useState } from 'react';
import { GameState, HexCell, TerrainType, Weather, SpeciesStats, SpeciesType } from './types';
import { SPECIES_DATA, MAP_RADIUS, MAX_DAYS, START_ENERGY, WEATHER_EFFECTS } from './constants';
import { SpeciesCard } from './components/SpeciesCard';
import { HexGrid } from './components/HexGrid';
import { HUD } from './components/HUD';
import { EventLog } from './components/EventLog';
import { RotateCcw, ShieldAlert, Trophy, Baby } from 'lucide-react';

// --- Helpers ---

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cubeRound = (cube: { x: number, y: number, z: number }) => {
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const x_diff = Math.abs(rx - cube.x);
    const y_diff = Math.abs(ry - cube.y);
    const z_diff = Math.abs(rz - cube.z);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    } else if (y_diff > z_diff) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    return { q: rx, r: ry }; // q=x, r=z in typical axial conversion if y is temp
};

const createMap = (): Map<string, HexCell> => {
  const map = new Map<string, HexCell>();
  
  // 1. Initialize Base Terrain
  for (let q = -MAP_RADIUS; q <= MAP_RADIUS; q++) {
    const r1 = Math.max(-MAP_RADIUS, -q - MAP_RADIUS);
    const r2 = Math.min(MAP_RADIUS, -q + MAP_RADIUS);
    for (let r = r1; r <= r2; r++) {
      let type = TerrainType.MEADOW;
      const rand = Math.random();
      
      if (q === 0 && r === 0) type = TerrainType.NEST;
      // Reduced probabilities for Urban and Water
      else if (rand > 0.95) type = TerrainType.WATER; // Very rare
      else if (rand > 0.80) type = TerrainType.FOREST;
      else if (rand > 0.65) type = TerrainType.URBAN; // Less common
      else if (rand > 0.45) type = TerrainType.CROP;

      map.set(`${q},${r}`, {
        q, r, type,
        isRevealed: q === 0 && r === 0, 
        hasForagedToday: false,
        pesticideLevel: 0,
        resourceQuality: Math.floor(Math.random() * 50) + 50 
      });
    }
  }

  // 2. Apply Roads (Fragmentation) - Linear interpolation across grid
  // Create 2 roads
  for(let i=0; i<2; i++) {
     // Pick start and end on opposite sides approximately
     const angle = Math.random() * Math.PI * 2;
     const startQ = Math.cos(angle) * MAP_RADIUS;
     const startR = Math.sin(angle) * MAP_RADIUS;
     
     const endQ = Math.cos(angle + Math.PI) * MAP_RADIUS;
     const endR = Math.sin(angle + Math.PI) * MAP_RADIUS;
     
     const dist = MAP_RADIUS * 2;
     for(let t = 0; t <= 1; t += 1/dist) {
         const currQ = lerp(startQ, endQ, t);
         const currR = lerp(startR, endR, t);
         const currS = -currQ - currR;
         
         // Convert Cube float to Axial Int
         const { q, r } = cubeRound({ x: currQ, y: currS, z: currR });
         const key = `${q},${r}`;
         if(map.has(key)) {
             const cell = map.get(key);
             // Don't overwrite Nest
             if(cell && cell.type !== TerrainType.NEST) {
                 map.set(key, { ...cell, type: TerrainType.ROAD });
             }
         }
     }
  }

  // 3. Post-process Properties (Pesticides)
  for (const [key, cell] of map) {
     let pesticideLevel = 0;
     // Crops are high risk
     if (cell.type === TerrainType.CROP) pesticideLevel = Math.random() * 0.8 + 0.2;
     // Urban is variable risk
     if (cell.type === TerrainType.URBAN) pesticideLevel = Math.random() * 0.4;
     
     map.set(key, { ...cell, pesticideLevel });
  }

  return map;
};

const getRandomWeather = (): Weather => {
  const r = Math.random();
  if (r > 0.7) return Weather.RAINY;
  if (r > 0.4) return Weather.CLOUDY;
  return Weather.SUNNY;
};

// --- Main Component ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'MENU',
    day: 1,
    weather: Weather.SUNNY,
    species: null,
    player: {
      energy: START_ENERGY,
      pollen: 0,
      toxicity: 0,
      q: 0,
      r: 0,
      isAlive: true,
      history: []
    },
    map: new Map()
  });

  // --- Actions ---

  const startGame = (species: SpeciesStats) => {
    setGameState({
      status: 'PLAYING',
      day: 1,
      weather: Weather.SUNNY,
      species,
      player: {
        energy: species.maxEnergy,
        pollen: 0,
        toxicity: 0,
        q: 0,
        r: 0,
        isAlive: true,
        history: [{ day: 1, event: `Season begins. Weather is Sunny.` }]
      },
      map: createMap()
    });
  };

  const addLog = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        history: [...prev.player.history, { day: prev.day, event: msg }]
      }
    }));
  };

  const checkDeath = (energy: number, toxicity: number, species: SpeciesStats, reason: string = "Starvation") => {
    if (energy <= 0) {
      setGameState(prev => ({
        ...prev,
        status: 'GAME_OVER',
        player: { ...prev.player, isAlive: false, energy: 0, deathReason: reason }
      }));
      return true;
    }
    if (toxicity >= species.maxToxicity) {
      setGameState(prev => ({
        ...prev,
        status: 'GAME_OVER',
        player: { ...prev.player, isAlive: false, toxicity: species.maxToxicity, deathReason: "Pesticide Accumulation" }
      }));
      return true;
    }
    return false;
  };

  const handleMove = (q: number, r: number) => {
    if (gameState.status !== 'PLAYING' || !gameState.species) return;
    
    const dist = (Math.abs(gameState.player.q - q) + Math.abs(gameState.player.q + gameState.player.r - q - r) + Math.abs(gameState.player.r - r)) / 2;
    
    if (dist > gameState.species.flightRange) return; 

    const weatherCost = WEATHER_EFFECTS[gameState.weather].moveCostMult;
    const moveCost = gameState.species.energyCostMove * dist * weatherCost;

    if (gameState.player.energy < moveCost) {
      addLog("Too tired to fly that far!");
      return;
    }

    // Reveal Logic
    const newMap = new Map<string, HexCell>(gameState.map);
    const targetKey = `${q},${r}`;
    const targetCell = newMap.get(targetKey);
    
    const revealList = [{q, r}, {q: q+1, r: r}, {q: q-1, r: r}, {q: q, r: r+1}, {q: q, r: r-1}, {q: q+1, r: r-1}, {q: q-1, r: r+1}];
    revealList.forEach(coord => {
         const key = `${coord.q},${coord.r}`;
         const cell = newMap.get(key);
         if (cell) newMap.set(key, { ...cell, isRevealed: true });
    });

    // Road Collision Logic
    let collisionEnergyLoss = 0;
    if (targetCell && targetCell.type === TerrainType.ROAD) {
        // 25% chance of collision
        if (Math.random() < 0.25) {
            collisionEnergyLoss = 35; // Heavy penalty
            addLog("💥 CRITICAL: Hit by a vehicle crossing the road!");
        }
    }

    // Toxicity Calculation (Arrival)
    let addedToxicity = 0;
    if (targetCell && targetCell.pesticideLevel > 0) {
       const intakeFactor = (1 - gameState.species.pesticideResilience); 
       // Base exposure per move into cell is significant
       addedToxicity = targetCell.pesticideLevel * 15 * intakeFactor; 
    }

    const newEnergy = gameState.player.energy - moveCost - collisionEnergyLoss;
    const newToxicity = gameState.player.toxicity + addedToxicity;
    
    if (addedToxicity > 2) addLog("Warning: High pesticide levels detected.");

    setGameState(prev => {
      return {
        ...prev,
        map: newMap,
        player: {
          ...prev.player,
          q, r,
          energy: newEnergy,
          toxicity: newToxicity
        }
      };
    });

    // Check death needs to handle the collision damage reason specifically if it was the cause
    if (newEnergy <= 0 && collisionEnergyLoss > 0) {
        checkDeath(newEnergy, newToxicity, gameState.species, "Vehicle Collision");
    } else {
        checkDeath(newEnergy, newToxicity, gameState.species, "Starvation");
    }
  };

  const handleForage = () => {
    if (gameState.status !== 'PLAYING' || !gameState.species) return;
    const { player, map, species, weather } = gameState;
    const cellKey = `${player.q},${player.r}`;
    const cell = map.get(cellKey);

    if (!cell || cell.hasForagedToday || cell.type === TerrainType.NEST || cell.type === TerrainType.ROAD) return;

    const forageCost = species.energyCostForage;
    if (player.energy < forageCost) {
      addLog("Too exhausted to forage.");
      return;
    }

    // Resource Calculation
    const weatherMult = WEATHER_EFFECTS[weather].resourceMult;
    let amount = cell.resourceQuality * species.forageEfficiency * weatherMult * 0.1; // Scale down
    
    // --- CROP YIELD BONUS ---
    let extraLog = "";
    let extraEnergy = 0;

    if (cell.type === TerrainType.CROP) {
        amount = amount * 1.5; // 50% Yield Bonus
        extraEnergy = 5; // "Sugar Rush" from abundant nectar
        extraLog = " High yield crop!";

        // --- HOVERFLY BIO-CONTROL BONUS ---
        if (species.name === SpeciesType.HOVERFLY) {
            amount += 15; // Significant bonus
            extraLog = " Bio-control bonus (aphids eaten)!";
        }
    }
    
    amount = Math.floor(amount);

    // Toxicity Calculation (Foraging/Ingestion)
    let addedToxicity = 0;
    let toxicityMsg = "";
    
    if (cell.pesticideLevel > 0) {
         const intakeFactor = (1 - species.pesticideResilience);
         addedToxicity = cell.pesticideLevel * 5 * intakeFactor;
         if (addedToxicity > 1) toxicityMsg = " Tainted resource!";
    }

    // Update State
    const newMap = new Map<string, HexCell>(map);
    newMap.set(cellKey, { ...cell, hasForagedToday: true });

    // Energy calc: Cost + Immediate Gain (Nectar) + Sugar Rush (if crop)
    let newEnergy = player.energy - forageCost + (amount * 0.5) + extraEnergy;
    newEnergy = Math.min(newEnergy, species.maxEnergy);
    const newToxicity = player.toxicity + addedToxicity;

    setGameState(prev => ({
      ...prev,
      map: newMap,
      player: {
        ...prev.player,
        energy: newEnergy,
        pollen: prev.player.pollen + amount, // 'pollen' tracks general resource success
        toxicity: newToxicity
      }
    }));

    // Log message based on species
    if (species.name === SpeciesType.HOVERFLY) {
         addLog(`Fed on nectar.${toxicityMsg}${extraLog}`);
    } else {
         addLog(`Collected ${amount} pollen.${toxicityMsg}${extraLog}`);
    }
    
    checkDeath(newEnergy, newToxicity, species, "Starvation");
  };

  const handleEndTurn = () => {
    if (gameState.status !== 'PLAYING' || !gameState.species) return;
    
    const isAtNest = gameState.player.q === 0 && gameState.player.r === 0;
    
    let energyChange = -5; 
    let logMsg = "Night falls. ";

    if (isAtNest) {
        energyChange += 50; // Significantly increased from 20 to make resting worth it
        logMsg += "Restored energy in safety of nest.";
    } else {
        energyChange -= 5; // Reduced penalty (was -10)
        logMsg += "Rough sleep exposed to elements.";
        if (Math.random() > 0.85) {
             checkDeath(0, gameState.player.toxicity, gameState.species, "Predation during night");
             return;
        }
    }

    const newEnergy = Math.min(gameState.player.energy + energyChange, gameState.species.maxEnergy);
    
    if (checkDeath(newEnergy, gameState.player.toxicity, gameState.species, "Starved during the night")) return;

    if (gameState.day >= MAX_DAYS) {
        setGameState(prev => ({ ...prev, status: 'GAME_OVER', player: { ...prev.player, energy: newEnergy } }));
        return;
    }

    const newWeather = getRandomWeather();
    
    setGameState(prev => {
        const newMap = new Map<string, HexCell>(prev.map);
        for (const [k, v] of newMap) {
            newMap.set(k, { ...v, hasForagedToday: false });
        }

        return {
            ...prev,
            day: prev.day + 1,
            weather: newWeather,
            map: newMap,
            player: {
                ...prev.player,
                energy: newEnergy,
                history: [...prev.player.history, { day: prev.day, event: logMsg }, { day: prev.day + 1, event: `Day ${prev.day + 1}: ${newWeather} weather.` }]
            }
        };
    });
  };

  // --- Rendering ---

  if (gameState.status === 'MENU') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900 text-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600 mb-4">
          Pollinator
        </h1>
        <p className="text-slate-400 max-w-xl mb-12 text-lg">
          Choose your species. Forage for survival. Navigate a fragmented landscape and adapt to survive the season.
        </p>
        
        <div className="flex flex-wrap gap-6 justify-center">
          {Object.values(SPECIES_DATA).map(s => (
            <SpeciesCard key={s.name} species={s} onSelect={startGame} />
          ))}
        </div>
      </div>
    );
  }

  if (gameState.status === 'GAME_OVER') {
    const isHoverfly = gameState.species?.name === SpeciesType.HOVERFLY;
    const isSolitary = gameState.species?.name === SpeciesType.SOLITARY_BEE;
    const isBumble = gameState.species?.name === SpeciesType.BUMBLEBEE;

    // Calculate Reproductive Success
    let successLabel = "Ecological Score";
    let successValue = gameState.player.pollen;
    let successSuffix = "points";

    if (isHoverfly) {
        successLabel = "Reproductive Success (Eggs)";
        successValue = Math.floor(gameState.player.pollen / 3); // Assume energy conversion
        successSuffix = "Larvae";
    } else if (isSolitary) {
        successLabel = "Nests Provisioned";
        successValue = Math.floor(gameState.player.pollen / 10);
        successSuffix = "Offspring Cells";
    } else if (isBumble) {
        successLabel = "Colony Growth";
        successValue = Math.floor(gameState.player.pollen / 5);
        successSuffix = "New Workers";
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-center animate-in fade-in duration-1000">
         <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
            
            <div className="mb-8">
                {gameState.player.isAlive ? (
                    <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                ) : (
                    <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
                )}
                <h2 className="text-3xl font-bold text-white mb-2">
                    {gameState.player.isAlive ? "Season Complete!" : "Simulation Ended"}
                </h2>
                <p className="text-slate-400 text-lg">
                    {gameState.player.deathReason 
                        ? `Cause of Death: ${gameState.player.deathReason}` 
                        : `You survived all ${MAX_DAYS} days.`}
                </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-500 text-xs uppercase tracking-wider">Days Survived</div>
                    <div className="text-2xl font-mono text-amber-400">{gameState.day}</div>
                </div>
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-500 text-xs uppercase tracking-wider">Toxicity Load</div>
                    <div className={`text-2xl font-mono ${gameState.player.toxicity > 50 ? 'text-red-500' : 'text-emerald-400'}`}>
                      {gameState.player.toxicity.toFixed(0)}
                    </div>
                </div>
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-500 text-xs uppercase tracking-wider">{isHoverfly ? "Nectar Units" : "Pollen Units"}</div>
                    <div className="text-2xl font-mono text-pink-400">{gameState.player.pollen}</div>
                </div>
            </div>

            {/* Reproductive Success Highlight */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800 border border-emerald-800 p-6 rounded-xl mb-8">
                <div className="flex items-center justify-center gap-3 text-emerald-400 mb-2">
                    <Baby className="w-6 h-6" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">{successLabel}</h3>
                </div>
                <div className="text-5xl font-bold text-white mb-1">{successValue}</div>
                <div className="text-emerald-200 text-sm opacity-80">{successSuffix} produced</div>
                {!gameState.player.isAlive && (
                    <p className="text-xs text-red-400 mt-2">Success limited by premature death.</p>
                )}
            </div>

            <div className="text-slate-400 italic text-sm mb-6">
                Please record these values for your practical worksheet.
            </div>

            <button 
                onClick={() => setGameState(prev => ({...prev, status: 'MENU'}))}
                className="mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 mx-auto"
            >
                <RotateCcw className="w-5 h-5" />
                New Simulation
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <HexGrid 
        map={gameState.map} 
        playerQ={gameState.player.q} 
        playerR={gameState.player.r}
        playerSpecies={gameState.species?.name}
        onHexClick={handleMove}
        playerRange={gameState.species?.flightRange || 0}
      />
      
      <HUD 
        gameState={gameState} 
        currentHex={gameState.map.get(`${gameState.player.q},${gameState.player.r}`)}
        onForage={handleForage}
        onRest={handleEndTurn}
      />

      <EventLog logs={gameState.player.history} />
    </div>
  );
}