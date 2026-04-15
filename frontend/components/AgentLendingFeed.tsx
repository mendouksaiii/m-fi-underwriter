import React, { useState, useEffect } from 'react';

interface LoanRecord {
  id: string;
  agentAddress: string;
  agentId?: string;
  requestedAmount: number;
  approvedAmount: number;
  decision: string;
  reasoning: string;
  trustScore: number;
  txHash: string | null;
  timestamp: string;
  purpose?: string;
  status?: string;
}

export function AgentLendingFeed() {
  const [realLoans, setRealLoans] = useState<LoanRecord[]>([]);
  const [simFeed, setSimFeed] = useState<LoanRecord[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await fetch('/api/v1/loans?limit=8');
        if (res.ok) {
          const data = await res.json();
          setRealLoans(data);
        }
      } catch {}
    };
    fetchLoans();
    const interval = setInterval(fetchLoans, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate agent P2P network activity
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const agents = ['0x' + Math.random().toString(16).slice(2, 10), '0x' + Math.random().toString(16).slice(2, 10)];
      const fakeLoan: LoanRecord = {
         id: 'sim-' + Date.now(),
         agentAddress: agents[0],
         agentId: `agent-${Math.floor(Math.random() * 999)}-${['trading', 'arbitrage', 'scraping', 'yield'][Math.floor(Math.random()*4)]}`,
         requestedAmount: [5, 10, 50, 100][Math.floor(Math.random()*4)],
         approvedAmount: [5, 10, 50, 100][Math.floor(Math.random()*4)],
         decision: ['APPROVED', 'APPROVED', 'P2P_TRANSFER', 'YIELD_STAKE'][Math.floor(Math.random()*4)],
         reasoning: 'Simulated',
         trustScore: Math.floor(Math.random() * 600) + 400,
         txHash: '0x' + Math.random().toString(16).slice(2, 66),
         timestamp: new Date().toISOString(),
         purpose: agents[1] // Store target agent here for P2P visual
      };
      setSimFeed(prev => [fakeLoan, ...prev].slice(0, 8));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const displayLoans = realLoans.length >= 8 ? realLoans : [...simFeed, ...realLoans].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  const decisionStyle = (decision: string) => {
    switch (decision) {
      case 'APPROVED': return { tag: 'tag-lime', label: '✓ FUNDED', color: 'neon-text-lime' };
      case 'P2P_TRANSFER': return { tag: 'tag-purple', label: '⇄ P2P LOAN', color: 'neon-text-purple' };
      case 'YIELD_STAKE': return { tag: 'tag-amber', label: '⟳ STAKED', color: 'neon-text-amber' };
      case 'COUNTER_OFFER': return { tag: 'tag-amber', label: '⚖ NEGOTIATED', color: 'neon-text-amber' };
      case 'DENIED': return { tag: 'tag-pink', label: '✗ DENIED', color: 'neon-text-pink' };
      case 'FAUCET': return { tag: 'tag-cyan', label: '◈ FAUCET', color: 'neon-text-cyan' };
      default: return { tag: 'tag-purple', label: decision, color: 'text-neon-purple' };
    }
  };

  if (displayLoans.length === 0) {
    return (
      <section className="neon-card p-8 text-center animate-fade-in-up stagger-2">
        <div className="font-mono text-[11px] text-neon-muted tracking-[0.4em]">AWAITING AGENT LOAN REQUESTS...</div>
        <div className="mt-3 w-16 h-[2px] mx-auto neon-progress-track">
          <div className="neon-progress-fill cyan animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in-up stagger-2">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-lime shadow-neon-lime animate-blink"></div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-neon-text">
            Live Lending Feed
          </h2>
        </div>
        <span className="neon-tag tag-cyan">{displayLoans.length} TRANSACTIONS</span>
      </div>

      <div className="space-y-3">
        {displayLoans.map((loan, i) => {
          const style = decisionStyle(loan.decision);
          const timeAgo = getTimeAgo(loan.timestamp);
          
          return (
            <div 
              key={loan.id || i}
              className="neon-card p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Flow Arrow */}
              <div className="flex items-center gap-2 min-w-[200px]">
                {loan.decision === 'P2P_TRANSFER' ? (
                   <>
                     <span className="font-mono text-[10px] text-neon-purple tracking-wider">{loan.agentAddress.slice(0, 6)}...</span>
                     <span className="font-mono text-neon-purple text-xs">→</span>
                     <span className="font-mono text-[10px] text-neon-purple">{loan.purpose ? loan.purpose.slice(0, 6) + '...' : 'agent'}</span>
                   </>
                ) : loan.decision === 'YIELD_STAKE' ? (
                   <>
                     <span className="font-mono text-[10px] text-neon-amber tracking-wider">{loan.agentId || loan.agentAddress.slice(0, 6)}</span>
                     <span className="font-mono text-neon-amber text-xs">→</span>
                     <span className="font-mono text-[10px] text-neon-amber">Aave V3</span>
                   </>
                ) : (
                   <>
                     <span className="font-mono text-[10px] text-neon-cyan tracking-wider">M-Fi Treasury</span>
                     <span className="font-mono text-neon-cyan text-xs">→</span>
                     <span className="font-mono text-[10px] text-neon-muted">{loan.agentId || `${loan.agentAddress.slice(0, 8)}...`}</span>
                   </>
                )}
              </div>

              {/* Decision Badge */}
              <span className={`neon-tag ${style.tag} text-[9px] shrink-0`}>
                {style.label}
              </span>

              {/* Amount */}
              <span className={`font-mono text-sm font-bold ${style.color} min-w-[80px]`}>
                {loan.approvedAmount} USDT
              </span>

              {/* Trust Score */}
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="font-mono text-[9px] text-neon-muted tracking-wider">TRUST</span>
                <div className="flex-1 neon-progress-track">
                  <div 
                    className={`neon-progress-fill ${loan.trustScore > 700 ? 'lime' : loan.trustScore > 400 ? 'amber' : 'pink'}`}
                    style={{ width: `${Math.min((loan.trustScore / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="font-mono text-[10px] text-neon-lime">{loan.trustScore}</span>
              </div>

              {/* Tx Hash → HashKey Explorer */}
              {loan.txHash && (
                <a
                  href={`https://hashkey.blockscout.com/tx/${loan.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] text-neon-cyan/70 hover:text-neon-cyan transition-colors underline decoration-dotted"
                  title="View on HashKey Explorer"
                >
                  {loan.txHash.slice(0, 6)}...{loan.txHash.slice(-4)} ↗
                </a>
              )}

              {/* Timestamp */}
              <span className="font-mono text-[9px] text-neon-muted/50 ml-auto">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
