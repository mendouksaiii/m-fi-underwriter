import React, { useState, useEffect } from 'react';

interface AgentEntry {
  id: string;
  score: number;
  repaid: number;
  risk: string;
}

export function AgentLeaderboard() {
  const [agents, setAgents] = useState<AgentEntry[]>([]);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch('/api/v1/leaderboard');
        if (res.ok) setAgents(await res.json());
      } catch {}
    };
    fetchBoard();
    const interval = setInterval(fetchBoard, 10000);
    return () => clearInterval(interval);
  }, []);

  const rankColor = (i: number) => {
    if (i === 0) return 'cyan';
    if (i === 1) return 'lime';
    if (i === 2) return 'amber';
    return 'pink';
  };

  return (
    <div className="neon-card animate-fade-in-up stagger-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-neon-text">
          Trust Leaderboard
        </h3>
        <span className="neon-tag tag-cyan text-[9px]">TOP AGENTS</span>
      </div>

      <div className="divide-y divide-white/5">
        {agents.length === 0 ? (
          <div className="p-6 text-center font-mono text-[11px] text-neon-muted tracking-widest">
            NO AGENT DATA YET
          </div>
        ) : (
          agents.map((agent, i) => {
            const color = rankColor(i);
            return (
              <div key={agent.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                {/* Rank */}
                <span className={`font-display text-lg font-bold w-8 neon-text-${color}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-neon-text truncate">{agent.id}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-[9px] text-neon-muted tracking-wider">{agent.repaid} REPAID</span>
                    <span className="font-mono text-[9px] text-neon-muted tracking-wider">RISK {agent.risk}</span>
                  </div>
                </div>

                {/* Trust Score with progress bar */}
                <div className="w-24">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-neon-muted tracking-wider">TRUST</span>
                    <span className={`font-mono text-xs font-bold neon-text-${color}`}>{agent.score}</span>
                  </div>
                  <div className="neon-progress-track">
                    <div 
                      className={`neon-progress-fill ${color}`}
                      style={{ width: `${Math.min((agent.score / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}