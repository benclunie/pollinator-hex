import React, { useMemo } from 'react';
import { HexCell, TerrainType, SpeciesType } from '../types';
import { HEX_SIZE, TERRAIN_CONFIG } from '../constants';
import { Home } from 'lucide-react';
import { BeeIcon } from './BeeIcon';
import { FlyIcon } from './FlyIcon';

interface Props {
  map: Map<string, HexCell>;
  playerQ: number;
  playerR: number;
  playerSpecies?: SpeciesType;
  onHexClick: (q: number, r: number) => void;
  playerRange: number;
}

export const HexGrid: React.FC<Props> = ({ map, playerQ, playerR, playerSpecies, onHexClick, playerRange }) => {
  
  // Helper to convert axial to pixel
  const hexToPixel = (q: number, r: number) => {
    const x = HEX_SIZE * (3 / 2) * q;
    const y = HEX_SIZE * Math.sqrt(3) * (r + q / 2);
    return { x, y };
  };

  // Hexagon points string
  const hexPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i;
      const angle_rad = Math.PI / 180 * angle_deg;
      points.push(`${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`);
    }
    return points.join(' ');
  }, []);

  // Calculate distance for valid moves highlight
  const getDistance = (q1: number, r1: number, q2: number, r2: number) => {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
  };

  const cells: HexCell[] = Array.from(map.values());

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-slate-950 relative cursor-grab active:cursor-grabbing">
      <svg width="1000" height="800" viewBox="-500 -400 1000 800" className="max-w-full max-h-full">
        <g>
          {cells.map((cell) => {
            const { x, y } = hexToPixel(cell.q, cell.r);
            const dist = getDistance(playerQ, playerR, cell.q, cell.r);
            const inRange = dist <= playerRange && dist > 0;
            const isPlayer = cell.q === playerQ && cell.r === playerR;
            const isRevealed = cell.isRevealed;
            
            // Determine fill color
            let fill = '#1e293b'; // Default slate-800 (fog)
            if (isRevealed) {
                fill = TERRAIN_CONFIG[cell.type].color;
            } else if (inRange) {
                fill = '#334155'; // Slightly lighter fog if reachable
            }

            // Opacity for fog
            const opacity = isRevealed ? 1 : 0.4;
            const stroke = isRevealed ? '#0f172a' : '#334155';

            return (
              <g 
                key={`${cell.q},${cell.r}`} 
                transform={`translate(${x},${y})`}
                onClick={() => inRange && onHexClick(cell.q, cell.r)}
                className={inRange ? "cursor-pointer hover:opacity-80" : ""}
                style={{ transition: 'all 0.3s ease' }}
              >
                <polygon 
                  points={hexPoints} 
                  fill={fill} 
                  stroke={stroke} 
                  strokeWidth="2"
                  fillOpacity={opacity}
                />
                
                {/* Terrain Icon / Indicator */}
                {isRevealed && cell.type === TerrainType.NEST && (
                   <Home x="-12" y="-12" width="24" height="24" className="text-white drop-shadow-md" strokeWidth={2} />
                )}
                
                {/* Player Icon */}
                {isPlayer && (
                  <foreignObject x="-15" y="-15" width="30" height="30">
                     <div className="w-full h-full flex items-center justify-center text-white drop-shadow-lg animate-pulse">
                        {playerSpecies === SpeciesType.HOVERFLY ? (
                           <FlyIcon size={24} className="text-white" />
                        ) : (
                           <BeeIcon size={24} className="text-white" />
                        )}
                     </div>
                  </foreignObject>
                )}

                {/* Resource Indicator (simple dot if not foraged) */}
                {isRevealed && !cell.hasForagedToday && cell.type !== TerrainType.NEST && cell.type !== TerrainType.WATER && cell.type !== TerrainType.ROAD && (
                    <circle cx="0" cy="0" r="4" fill="white" opacity="0.7" />
                )}
                
                {/* Range Hint */}
                {inRange && !isRevealed && (
                     <circle cx="0" cy="0" r="2" fill="#fbbf24" opacity="0.5" />
                )}
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Fog Legend / Overlay Hint */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-500 pointer-events-none">
        Grid System: Axial Coordinates
      </div>
    </div>
  );
};