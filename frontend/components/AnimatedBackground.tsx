import React from 'react';

export function AnimatedBackground() {
  return (
    <>
      {/* Animated Grid */}
      <div 
        className="fixed inset-0 z-0 opacity-100 animate-grid-shift"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow Orb 1 — Cyan (Top-Left) */}
      <div 
        className="fixed z-0 animate-pulse-glow-1 pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,245,255,0.12) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
        }}
      />

      {/* Glow Orb 2 — Pink (Bottom-Right) */}
      <div 
        className="fixed z-0 animate-pulse-glow-2 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255,0,110,0.10) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-50px',
        }}
      />

      {/* Glow Orb 3 — Purple (Center-Right) */}
      <div 
        className="fixed z-0 animate-float pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(191,0,255,0.06) 0%, transparent 70%)',
          top: '40%',
          right: '10%',
        }}
      />
    </>
  );
}