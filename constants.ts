import { SpeciesStats, SpeciesType, TerrainType, Weather } from './types';

export const HEX_SIZE = 30;
export const MAP_RADIUS = 6;
export const MAX_DAYS = 15;
export const START_ENERGY = 100;

export const SPECIES_DATA: Record<SpeciesType, SpeciesStats> = {
  [SpeciesType.BUMBLEBEE]: {
    name: SpeciesType.BUMBLEBEE,
    description: "Social, large-bodied. High energy needs but robust. Needs pollen for the colony.",
    maxEnergy: 150,
    energyCostMove: 10,
    energyCostForage: 5,
    forageEfficiency: 1.5,
    pesticideResilience: 0.4,
    maxToxicity: 100,
    flightRange: 3,
    traits: ["Social", "Generalist", "Cold Tolerant"]
  },
  [SpeciesType.SOLITARY_BEE]: {
    name: SpeciesType.SOLITARY_BEE,
    description: "Independent, central-place forager. Sensitive to environment. Provisions individual nest cells.",
    maxEnergy: 80,
    energyCostMove: 5,
    energyCostForage: 3,
    forageEfficiency: 1.2,
    pesticideResilience: 0.2,
    maxToxicity: 60,
    flightRange: 2,
    traits: ["Specialist", "Central Place Forager"]
  },
  [SpeciesType.HOVERFLY]: {
    name: SpeciesType.HOVERFLY,
    description: "Mimicry master. Larvae are bio-control agents (eat aphids). High pesticide tolerance.",
    maxEnergy: 100,
    energyCostMove: 4,
    energyCostForage: 4,
    forageEfficiency: 0.8,
    pesticideResilience: 0.85, // Increased from 0.7 for higher tolerance
    maxToxicity: 30, // Low max threshold, but fills up very slowly due to resilience
    flightRange: 4,
    traits: ["Bio-Control Agent", "Generalist", "Mobile"]
  }
};

export const TERRAIN_CONFIG: Record<TerrainType, { color: string, label: string, risk: string, resources: string }> = {
  [TerrainType.MEADOW]: { color: '#a3e635', label: 'Wildflower Meadow', risk: 'Low', resources: 'High' },
  [TerrainType.FOREST]: { color: '#166534', label: 'Ancient Woodland', risk: 'Low', resources: 'Medium' },
  [TerrainType.CROP]: { color: '#eab308', label: 'Mass Flowering Crop', risk: 'High (Pesticides)', resources: 'Abundant (Bonus)' },
  [TerrainType.URBAN]: { color: '#64748b', label: 'Urban Gardens', risk: 'Medium', resources: 'Variable' },
  [TerrainType.WATER]: { color: '#3b82f6', label: 'Water Body', risk: 'Exhaustion Risk', resources: 'Hydration Boost' },
  [TerrainType.ROAD]: { color: '#94a3b8', label: 'Paved Road', risk: 'Medium (Collision)', resources: 'None' },
  [TerrainType.NEST]: { color: '#78350f', label: 'Nest / Shelter', risk: 'None', resources: 'Safe Haven' }
};

export const WEATHER_EFFECTS: Record<Weather, { moveCostMult: number, resourceMult: number, desc: string }> = {
  [Weather.SUNNY]: { moveCostMult: 1, resourceMult: 1, desc: 'Ideal conditions.' },
  [Weather.RAINY]: { moveCostMult: 2, resourceMult: 0.2, desc: 'Hard to fly, nectar washed away.' },
  [Weather.CLOUDY]: { moveCostMult: 1.2, resourceMult: 0.8, desc: 'Cooler, flowers close partially.' }
};