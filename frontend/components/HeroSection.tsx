import React from 'react';
import { ConnectWallet } from './ConnectWallet';

interface HeroSectionProps {
  onAddressChange: (address: string | null) => void;
}

export function HeroSection({ onAddressChange }: HeroSectionProps) {
  return (
    <header className="relative z-10 border-b border-neon-cyan/15 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 bg-neon-bg/95 backdrop-blur-md overflow-hidden">
      {/* Animated gradient bottom line */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[1px] animate-nav-glow"
        style={{
          background: 'linear-gradient(90deg, transparent, #00f5ff, #ff006e, #bf00ff, transparent)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="flex items-center gap-4">
        <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-neon-cyan animate-blink"></div>
        <span className="font-display text-lg font-bold tracking-widest neon-text-cyan">M—Fi</span>
        <span className="hidden md:flex items-center gap-2 font-mono text-[10px] text-neon-muted tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-lime shadow-neon-lime"></span>
          UNDERWRITER NODE
        </span>
      </div>

      <nav className="flex items-center gap-3 md:gap-6">
        <span className="hidden md:inline font-mono text-[11px] tracking-[0.15em] text-neon-muted uppercase hover:text-neon-cyan transition-colors cursor-pointer">
          Dashboard
        </span>
        <span className="hidden lg:inline font-mono text-[11px] tracking-[0.15em] text-neon-muted uppercase hover:text-neon-cyan transition-colors cursor-pointer">
          Ledger
        </span>
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-neon-lime">
          <span className="w-[6px] h-[6px] rounded-full bg-neon-lime shadow-neon-lime animate-blink"></span>
          ONLINE
        </div>
        <ConnectWallet onAddressChange={onAddressChange} />
      </nav>
    </header>
  );
}