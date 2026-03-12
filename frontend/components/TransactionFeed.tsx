import React, { useState, useEffect } from 'react';

interface LoanRecord {
  id: string;
  agentAddress: string;
  decision: string;
  approvedAmount: number;
  txHash: string | null;
  timestamp: string;
  purpose?: string;
  status?: string;
}

export function TransactionFeed() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await fetch('/api/v1/loans?limit=10');
        if (res.ok) setLoans(await res.json());
      } catch {}
    };
    fetchLoans();
    const interval = setInterval(fetchLoans, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (decision: string) => {
    switch (decision) {
      case 'APPROVED': return 'text-neon-lime';
      case 'DENIED': return 'text-neon-pink';
      case 'COUNTER_OFFER': return 'text-neon-amber';
      case 'FAUCET': return 'text-neon-cyan';
      default: return 'text-neon-muted';
    }
  };

  return (
    <div className="neon-card animate-fade-in-up stagger-3 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-neon-text">
          Transaction Ledger
        </h3>
        <span className="font-mono text-[10px] text-neon-muted tracking-widest">{loans.length} RECORDS</span>
      </div>

      <div className="divide-y divide-white/5">
        {loans.length === 0 ? (
          <div className="p-6 text-center font-mono text-[11px] text-neon-muted tracking-widest">
            NO TRANSACTIONS RECORDED
          </div>
        ) : (
          loans.map((loan, i) => (
            <div key={loan.id || i} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full ${
                loan.decision === 'APPROVED' ? 'bg-neon-lime shadow-neon-lime' :
                loan.decision === 'DENIED' ? 'bg-neon-pink shadow-neon-pink' :
                loan.decision === 'FAUCET' ? 'bg-neon-cyan shadow-neon-cyan' : 'bg-neon-amber shadow-neon-amber'
              }`}></div>
              
              {/* Address */}
              <span className="font-mono text-[11px] text-neon-muted min-w-[90px]">
                {loan.agentAddress.slice(0, 8)}...
              </span>
              
              {/* Decision */}
              <span className={`font-mono text-[10px] uppercase tracking-wider min-w-[80px] ${statusColor(loan.decision)}`}>
                {loan.decision}
              </span>
              
              {/* Amount */}
              <span className="font-mono text-xs text-neon-text ml-auto">
                {loan.approvedAmount} <span className="text-neon-muted text-[10px]">USDT</span>
              </span>
              
              {/* TxHash link */}
              {loan.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${loan.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-neon-cyan hover:underline"
                >
                  ↗
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}