import React, { useEffect, useRef } from 'react';

interface Props {
  logs: { day: number, event: string }[];
}

export const EventLog: React.FC<Props> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="fixed top-20 right-4 w-64 h-96 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-none hidden lg:flex">
      <div className="bg-slate-800 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700">
        Field Notes
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide pointer-events-auto">
        {logs.length === 0 && <p className="text-slate-500 text-sm italic">Simulation started...</p>}
        {logs.map((log, i) => (
          <div key={i} className="text-sm border-l-2 border-slate-600 pl-3 py-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-amber-500 font-mono text-xs mr-2">Day {log.day}</span>
            <p className="text-slate-200 leading-snug">{log.event}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};