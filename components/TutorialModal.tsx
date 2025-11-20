import React from 'react';
import { X, Battery, Skull, Flower, Sun, AlertTriangle, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-2xl font-bold text-amber-400">Field Guide & Protocols</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-slate-300 scrollbar-hide">
          
          {/* Section 1: Objective */}
          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Objective: Survival & Reproduction
            </h3>
            <p className="text-sm leading-relaxed">
              You must survive for <strong>15 Days</strong> while maximizing your reproductive success. 
              Success is measured differently for each species (Colony growth, Nests provisioned, or Larvae produced), 
              but all require collecting resources (Pollen/Nectar).
            </p>
          </section>

          {/* Section 2: Core Mechanics */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-amber-200 mb-2 flex items-center gap-2">
                <Battery className="w-4 h-4" /> Energy Budget
              </h4>
              <ul className="text-sm space-y-2 list-disc pl-4 text-slate-400">
                <li><strong>Movement:</strong> Flying costs energy based on distance.</li>
                <li><strong>Foraging:</strong> Costs energy but yields resources.</li>
                <li><strong>Resting:</strong> Returning to the <span className="text-emerald-400">Nest</span> restores significant energy (+50). Sleeping outside restores little (+15) and risks predation.</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-purple-200 mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4" /> Toxicity & Risks
              </h4>
              <ul className="text-sm space-y-2 list-disc pl-4 text-slate-400">
                <li><strong>Pesticides:</strong> Accumulate in your body when visiting <span className="text-yellow-500">Crops</span> or <span className="text-slate-400">Urban</span> areas.</li>
                <li><strong>Lethal Threshold:</strong> Reaching max toxicity causes death.</li>
                <li><strong>Roads:</strong> Crossing roads carries a 25% risk of vehicle collision (massive energy loss).</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Habitat Interactions */}
          <section className="space-y-3">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flower className="w-5 h-5 text-pink-400" />
              Landscape Ecology
            </h3>
            <div className="grid gap-3 text-sm md:grid-cols-2">
                <div className="flex gap-3 items-start">
                    <span className="bg-emerald-600/20 text-emerald-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">MEADOW</span>
                    <p>Safe, reliable resources (High). Low risk. The standard foraging ground.</p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-green-800/20 text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">FOREST</span>
                    <p>Ancient Woodland. Medium resources, very low risk. Good for safe travel.</p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">CROPS</span>
                    <p>High yield ("Sugar Rush") but high pesticide risk. <br/><span className="text-cyan-400 italic">Hoverflies gain a Bio-Control Bonus here.</span></p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-slate-600/40 text-slate-300 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">URBAN</span>
                    <p>Gardens. Variable resources. Medium pesticide risk from garden chemicals.</p>
                </div>
                 <div className="flex gap-3 items-start">
                    <span className="bg-amber-900/40 text-amber-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">NEST</span>
                    <p>Your home. No resources, but allows for full energy recovery (+50).</p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-blue-900/40 text-blue-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">WATER</span>
                    <p>Water bodies. Zero resources. Risk of drowning or exhaustion.</p>
                </div>
                <div className="flex gap-3 items-start md:col-span-2">
                    <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap mt-1 min-w-[60px] text-center">ROADS</span>
                    <p>Fragment the landscape. No resources. High collision risk (25% chance of severe injury).</p>
                </div>
            </div>
          </section>

          {/* Section 4: Weather */}
          <section className="bg-blue-900/20 p-4 rounded-xl border border-blue-800/50">
             <h3 className="text-base font-bold text-blue-200 flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4" />
              Weather Impacts
            </h3>
            <p className="text-sm text-blue-100">
                Weather changes daily. <strong>Rain</strong> doubles movement costs and washes away nectar. 
                <strong>Cloudy</strong> weather reduces flower availability. Plan your foraging trips around the forecast.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}