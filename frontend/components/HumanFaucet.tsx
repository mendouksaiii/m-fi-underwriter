import React, { useState } from 'react';

interface HumanFaucetProps {
  connectedAddress: string | null;
}

export function HumanFaucet({ connectedAddress }: HumanFaucetProps) {
  const [recipient, setRecipient] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveRecipient = recipient || connectedAddress || '';

  const handleRequest = async () => {
    if (!effectiveRecipient) return;
    setStatus('pending');
    setTxHash(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientAddress: effectiveRecipient, amount: selectedAmount }),
      });
      const data = await res.json();
      if (res.ok && data.txHash) {
        setTxHash(data.txHash);
        setStatus('success');
      } else {
        setErrorMsg(data.message || 'Disbursement failed');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
      setStatus('error');
    }
  };

  return (
    <div className="neon-card p-6 animate-fade-in-up stagger-3">
      {/* Header with blink dot */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-neon-cyan/15">
        <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan animate-blink"></div>
        <h3 className="font-display text-sm font-bold text-neon-cyan tracking-widest">TEST FAUCET</h3>
      </div>

      {/* Amount Presets */}
      <div className="font-mono text-[10px] text-neon-muted tracking-[0.3em] uppercase mb-2">Amount (USDT)</div>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[1, 5, 10, 25].map(amt => (
          <button
            key={amt}
            onClick={() => setSelectedAmount(amt)}
            className={`py-2 font-mono text-sm text-center transition-all border ${
              selectedAmount === amt
                ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan'
                : 'border-white/10 text-neon-muted hover:border-neon-cyan/30 hover:text-neon-cyan'
            }`}
          >
            {amt}
          </button>
        ))}
      </div>

      {/* Recipient Input */}
      <div className="font-mono text-[10px] text-neon-muted tracking-[0.3em] uppercase mb-1">Recipient</div>
      <input
        type="text"
        value={effectiveRecipient}
        onChange={e => setRecipient(e.target.value)}
        placeholder="0x..."
        className="neon-input mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleRequest}
        disabled={!effectiveRecipient || status === 'pending'}
        className={`w-full py-3 font-display text-xs font-bold tracking-[0.2em] uppercase transition-all relative overflow-hidden ${
          status === 'pending'
            ? 'border border-neon-amber/50 text-neon-amber cursor-wait'
            : 'border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {status === 'pending' ? '⟳ DISBURSING...' : '→ REQUEST USDT'}
      </button>

      {/* Status Messages */}
      {status === 'success' && txHash && (
        <div className="mt-4 p-3 border border-neon-lime/30 bg-neon-lime/5">
          <div className="font-mono text-[10px] text-neon-lime tracking-widest mb-1">✓ DISBURSEMENT CONFIRMED</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-neon-cyan hover:underline break-all"
          >
            {txHash.slice(0, 20)}...{txHash.slice(-8)}
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 border border-neon-pink/30 bg-neon-pink/5">
          <div className="font-mono text-[10px] text-neon-pink tracking-widest">✗ {errorMsg}</div>
        </div>
      )}
    </div>
  );
}
