import React, { useState, useEffect } from 'react';

// M-Fi uses a kinked interest rate model similar to Aave/Compound
// Below optimal utilization: low slope. Above: steep slope to incentivize repayment.
function calculateAPY(utilization: number): number {
  const optimalUtilization = 0.8; // 80% kink point
  const baseRate = 2;             // 2% base
  const slope1 = 8;               // gentle slope below kink
  const slope2 = 75;              // steep slope above kink

  if (utilization <= optimalUtilization) {
    return baseRate + (utilization / optimalUtilization) * slope1;
  }
  return baseRate + slope1 + ((utilization - optimalUtilization) / (1 - optimalUtilization)) * slope2;
}

export function InterestRateModel() {
  const [currentUtil, setCurrentUtil] = useState(0.42);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Simulate live utilization changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUtil(prev => {
        const delta = (Math.random() - 0.48) * 0.03;
        return Math.max(0.05, Math.min(0.95, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate curve points
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i += 2) {
    points.push({ x: i / 100, y: calculateAPY(i / 100) });
  }

  const maxY = 90;
  const chartW = 400;
  const chartH = 180;

  const toSVG = (x: number, y: number) => ({
    sx: (x * chartW),
    sy: chartH - (y / maxY) * chartH,
  });

  const pathD = points.map((p, i) => {
    const { sx, sy } = toSVG(p.x, p.y);
    return `${i === 0 ? 'M' : 'L'}${sx},${sy}`;
  }).join(' ');

  // Fill area under curve
  const areaD = pathD + ` L${chartW},${chartH} L0,${chartH} Z`;

  const currentAPY = calculateAPY(currentUtil);
  const { sx: curX, sy: curY } = toSVG(currentUtil, currentAPY);
  const displayPoint = hoveredPoint !== null ? hoveredPoint : currentUtil;
  const displayAPY = calculateAPY(displayPoint);

  return (
    <section className="neon-card p-6 animate-fade-in-up stagger-3">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-amber shadow-neon-amber animate-blink"></div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-neon-text">
            Interest Rate Model
          </h2>
        </div>
        <span className="neon-tag tag-amber">KINKED CURVE</span>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <div className="font-mono text-[9px] text-neon-muted tracking-[0.3em] uppercase">Utilization</div>
          <div className="font-display text-lg font-bold neon-text-cyan">{(displayPoint * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-neon-muted tracking-[0.3em] uppercase">Borrow APY</div>
          <div className="font-display text-lg font-bold neon-text-amber">{displayAPY.toFixed(1)}%</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-neon-muted tracking-[0.3em] uppercase">Optimal</div>
          <div className="font-display text-lg font-bold neon-text-lime">80.0%</div>
        </div>
      </div>

      {/* SVG Curve */}
      <div className="relative" style={{ aspectRatio: `${chartW}/${chartH + 30}` }}>
        <svg
          viewBox={`-30 -10 ${chartW + 40} ${chartH + 30}`}
          className="w-full h-full"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const util = Math.max(0, Math.min(1, (x * (chartW + 40) - 30) / chartW));
            setHoveredPoint(util);
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(x => {
            const { sx } = toSVG(x, 0);
            return <line key={`gx-${x}`} x1={sx} y1={0} x2={sx} y2={chartH} stroke="rgba(255,255,255,0.05)" />;
          })}
          {[0, 20, 40, 60, 80].map(y => {
            const { sy } = toSVG(0, y);
            return (
              <g key={`gy-${y}`}>
                <line x1={0} y1={sy} x2={chartW} y2={sy} stroke="rgba(255,255,255,0.05)" />
                <text x={-5} y={sy + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">{y}%</text>
              </g>
            );
          })}

          {/* Optimal utilization line (kink) */}
          <line x1={chartW * 0.8} y1={0} x2={chartW * 0.8} y2={chartH} stroke="rgba(0,255,136,0.3)" strokeDasharray="4,4" />
          <text x={chartW * 0.8} y={-3} textAnchor="middle" fill="rgba(0,255,136,0.5)" fontSize="7" fontFamily="monospace">OPTIMAL</text>

          {/* Area fill */}
          <path d={areaD} fill="url(#rateGradient)" opacity="0.15" />

          {/* Curve line */}
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2" />

          {/* Current utilization marker */}
          <circle cx={curX} cy={curY} r="4" fill="#00e5ff" className="animate-pulse" />
          <circle cx={curX} cy={curY} r="8" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.4" className="animate-pulse" />

          {/* Gradient defs */}
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffab00" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffab00" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="75%" stopColor="#ffab00" />
              <stop offset="100%" stopColor="#ff1744" />
            </linearGradient>
          </defs>

          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map(x => (
            <text key={`xl-${x}`} x={chartW * x / 100} y={chartH + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">{x}%</text>
          ))}
        </svg>
      </div>

      <div className="font-mono text-[9px] text-neon-muted/50 text-center mt-2 tracking-widest">
        UTILIZATION RATE → BORROW APY (KINKED MODEL)
      </div>
    </section>
  );
}
