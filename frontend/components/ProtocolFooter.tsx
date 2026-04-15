import React from 'react';

export function ProtocolFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 py-12 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan animate-blink"></div>
          <span className="font-display text-sm font-bold tracking-widest neon-text-cyan">M—Fi</span>
          <span className="font-mono text-[10px] text-neon-muted tracking-widest">PROTOCOL v2.4.1</span>
        </div>
        <div className="neon-divider w-full md:hidden"></div>
        <p className="font-mono text-[11px] tracking-[0.4em] text-neon-muted uppercase">
          Autonomous Machine Finance · Built for AI Agents
        </p>
        <div className="flex items-center gap-4">
          <span className="neon-tag tag-cyan">HASHKEY</span>
          <span className="neon-tag tag-lime">WDK</span>
          <span className="neon-tag tag-amber">AAVE V3</span>
        </div>
      </div>
    </footer>
  );
}