import React, { useState, useEffect } from 'react';

export function LiveDashboard() {
  const [liveStats, setLiveStats] = useState({
    totalVolume: '0.00',
    activeLoans: 0,
    totalLoansProcessed: 0,
    approvalRate: '0.0',
    defaultRate: '0.00',
    counterOffers: 0,
    denials: 0,
    liquidBalance: '0.00'
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/stats');
        if (res.ok) {
          const data = await res.json();
          setLiveStats(data);
          setIsLive(true);
        }
      } catch {
        setIsLive(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'Total Volume',
      value: `$${liveStats.totalVolume}`,
      unit: 'USDT',
      change: `${liveStats.totalLoansProcessed} processed`,
      color: 'cyan' as const,
    },
    {
      label: 'Active Loans',
      value: String(liveStats.activeLoans),
      unit: 'CONTRACTS',
      change: `${liveStats.approvalRate}% approval`,
      color: 'lime' as const,
    },
    {
      label: 'Treasury Liquidity',
      value: `$${liveStats.liquidBalance}`,
      unit: 'USDT',
      change: 'Available for deployment',
      color: 'cyan' as const,
    },
    {
      label: 'Default Rate',
      value: `${liveStats.defaultRate}`,
      unit: '%',
      change: isLive ? 'Engine online' : 'Backend offline',
      color: 'pink' as const,
    }
  ];

  const glowMap = {
    cyan: { text: 'neon-text-cyan', border: 'border-neon-cyan/40', shadow: 'shadow-neon-cyan' },
    lime: { text: 'neon-text-lime', border: 'border-neon-lime/40', shadow: 'shadow-neon-lime' },
    pink: { text: 'neon-text-pink', border: 'border-neon-pink/40', shadow: 'shadow-neon-pink' },
    amber: { text: 'neon-text-amber', border: 'border-neon-amber/40', shadow: 'shadow-neon-amber' },
  };

  return (
    <section className="animate-fade-in-up stagger-1">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-neon-text">
          System Telemetrics
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-neon-lime shadow-neon-lime' : 'bg-neon-pink shadow-neon-pink'} animate-blink`}></span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-neon-muted">
            {isLive ? 'Live Sync' : 'No Backend'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const glow = glowMap[stat.color];
          return (
            <div
              key={i}
              className={`neon-card p-6 flex flex-col justify-between min-h-[160px] border-t-2 ${glow.border}`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-neon-muted">
                  {stat.label}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-display font-bold tracking-tight ${glow.text}`}>
                    {stat.value}
                  </span>
                  <span className="font-mono text-[10px] text-neon-muted tracking-wider">
                    {stat.unit}
                  </span>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-wider text-neon-muted/50">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}