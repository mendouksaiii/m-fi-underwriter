import React, { useState } from 'react';
import { ProtocolFooter } from '../components/ProtocolFooter';
import { ConnectWallet } from '../components/ConnectWallet';
import { AnimatedBackground } from '../components/AnimatedBackground';

interface LandingPageProps {
  onEnterCoreEngine: () => void;
}

export function LandingPage({ onEnterCoreEngine }: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [agentAddress, setAgentAddress] = useState('');
  const [amount, setAmount] = useState('5.00');

  React.useEffect(() => {
    fetch('/api/v1/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const handleRequestCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    onEnterCoreEngine();
  };

  return (
    <div className="min-h-screen bg-neon-bg text-neon-text flex flex-col relative overflow-x-hidden font-sans">
      <AnimatedBackground />

      {/* ═══════════════ NEON NAV ═══════════════ */}
      <header className="relative z-10 border-b border-neon-cyan/15 px-6 md:px-10 py-4 flex justify-between items-center sticky top-0 bg-neon-bg/95 backdrop-blur-md overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full h-[1px] animate-nav-glow"
          style={{
            background: 'linear-gradient(90deg, transparent, #00f5ff, #ff006e, #bf00ff, transparent)',
            backgroundSize: '200% 100%',
          }}
        />

        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-neon-cyan animate-blink"></div>
          <span className="font-display text-xl font-bold tracking-widest neon-text-cyan">M—Fi</span>
          <span className="hidden md:inline font-mono text-[10px] text-neon-muted tracking-widest">PROTOCOL v2.4</span>
        </div>
        <nav className="flex items-center gap-4 md:gap-8">
          <a href="#how-it-works" className="hidden md:inline font-mono text-[11px] tracking-[0.15em] text-neon-muted uppercase hover:text-neon-cyan transition-colors">
            Architecture
          </a>
          <a href="#tech-stack" className="hidden md:inline font-mono text-[11px] tracking-[0.15em] text-neon-muted uppercase hover:text-neon-cyan transition-colors">
            Stack
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-neon btn-outline-pink text-[10px] py-2 px-4"
          >
            Request Credit
          </button>
          <ConnectWallet />
          <button
            onClick={onEnterCoreEngine}
            className="btn-neon btn-solid-cyan text-[10px] py-2 px-4"
          >
            Open Ledger →
          </button>
        </nav>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative z-10 min-h-[80vh] flex items-center justify-center py-20 px-8 overflow-hidden">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="font-mono text-[12px] tracking-[0.4em] text-neon-cyan uppercase mb-6 opacity-80">
            // autonomous machine finance protocol
          </div>
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black leading-none mb-6">
            <span className="neon-text-cyan">M—Fi</span><br/>
            <span className="neon-text-pink">Underwriter</span>
          </h1>
          <p className="font-sans text-lg text-neon-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            The first autonomous credit bureau for AI agents. Instant risk assessment, 
            on-chain disbursement via Tether WDK, and DeFi yield optimization — all without a human in the loop.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={onEnterCoreEngine} className="btn-neon btn-solid-cyan py-3 px-8">
              Enter Dashboard →
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn-neon btn-outline-pink py-3 px-8">
              Request Credit
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ TECH SPECS ═══════════════ */}
      <section className="relative z-10 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {[
            { label: 'AI Risk Engine', value: 'Groq LLaMA 3.1 8B', sub: 'Inference latency: ~12ms', color: 'cyan' },
            { label: 'Settlement Layer', value: 'Ethereum Sepolia', sub: 'L1 Settlement • ~12s finality', color: 'pink' },
            { label: 'Treasury Engine', value: 'Tether WDK', sub: 'Institutional key management', color: 'lime' },
          ].map((spec, i) => (
            <div key={i} className="p-8 md:p-10">
              <div className="font-mono text-[10px] tracking-[0.4em] text-neon-muted uppercase mb-2">{spec.label}</div>
              <div className={`font-display text-xl font-bold neon-text-${spec.color}`}>{spec.value}</div>
              <div className="font-mono text-[11px] text-neon-muted/60 mt-1">{spec.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ LIVE METRICS BAR ═══════════════ */}
      <section className="relative z-10 border-b border-white/5 bg-neon-surface">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'Total Volume', value: stats ? `${stats.totalVolume} USDT` : '—', sub: 'Disbursed to agents' },
            { label: 'Active Loans', value: stats ? stats.activeLoans.toString() : '—', sub: 'Contracts live' },
            { label: 'Default Rate', value: stats ? `${stats.defaultRate}%` : '—', sub: 'Below industry avg' },
            { label: 'Approval Rate', value: stats ? `${stats.approvalRate}%` : '—', sub: 'Of all requests' },
          ].map((m, i) => (
            <div key={i} className="p-6 md:p-8">
              <div className="font-mono text-[10px] tracking-[0.4em] text-neon-muted uppercase mb-2">{m.label}</div>
              <div className="font-display text-2xl md:text-3xl font-bold neon-text-cyan tracking-tight">{m.value}</div>
              <div className="font-mono text-[11px] text-neon-muted/50 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="relative z-10 py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.5em] text-neon-muted uppercase mb-2">// protocol flow</div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-neon-text mb-10">How M—Fi Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Agent Request', desc: 'An AI agent sends a structured loan request via the OpenClaw ACP protocol, specifying amount, purpose, and collateral type.', color: 'cyan' },
              { step: '02', title: 'AI Underwriting', desc: 'Groq LLaMA 3.1 8B evaluates on-chain telemetry: wallet age, tx volume, prior defaults, and liquidity depth in under 200ms.', color: 'pink' },
              { step: '03', title: 'WDK Settlement', desc: 'Approved loans are signed and broadcast via the Tether WDK. Disbursement settles on Ethereum within a single block (~12s).', color: 'lime' },
              { step: '04', title: 'Yield & Repay', desc: 'Agents repay principal + micro-yield. Idle treasury floats are swept into Aave V3 pools for continuous base-layer yield.', color: 'amber' },
            ].map((s, i) => (
              <div key={i} className={`neon-card p-6 border-t-2 border-neon-${s.color}/40`}>
                <div className={`font-display text-3xl font-bold mb-4 neon-text-${s.color}`}>{s.step}</div>
                <h4 className="font-display text-xs font-bold tracking-widest text-neon-text uppercase mb-3">{s.title}</h4>
                <p className="text-sm text-neon-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="neon-divider"></div>

      {/* ═══════════════ CAPABILITIES ═══════════════ */}
      <section className="relative z-10 py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Agentic\nUnderwriting', desc: 'No human in the loop. Groq LLaMA 3.1 8B analyzes wallet age, tx count, prior defaults, and liquidity depth to generate instant decisions.', color: 'cyan' },
            { title: 'Tether WDK\nTreasury', desc: 'Institutional-grade key management via the official Tether Wallet Development Kit. HD wallet provisioning and EVM-native transaction broadcasting.', color: 'pink' },
            { title: 'DeFi Yield\nSweeping', desc: 'Zero idle capital. When no loans are outstanding, treasury funds auto-route to Aave V3 lending pools. Withdrawals happen on-demand.', color: 'amber' },
          ].map((f, i) => (
            <div key={i} className={`neon-card p-8 border-l-2 border-neon-${f.color}/40 hover:border-neon-${f.color}/80 transition-all`}>
              <h3 className={`font-display text-sm font-bold tracking-widest uppercase mb-4 whitespace-pre-line neon-text-${f.color}`}>{f.title}</h3>
              <p className="text-sm text-neon-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="neon-divider"></div>

      {/* ═══════════════ TECH STACK ═══════════════ */}
      <section id="tech-stack" className="relative z-10 py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.5em] text-neon-muted uppercase mb-2">// architecture</div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-neon-text mb-10">Tech Stack</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Runtime', title: 'Node.js + TypeScript', desc: 'Fully typed backend with Express.js API server.', color: 'cyan' },
              { label: 'Treasury', title: 'Tether WDK (EVM)', desc: 'HD wallet provisioning and deterministic signing.', color: 'pink' },
              { label: 'AI Engine', title: 'Groq LLaMA 3.1 8B', desc: 'Sub-200ms inference with structured JSON output.', color: 'lime' },
              { label: 'DeFi Layer', title: 'Aave V3 Protocol', desc: 'Automatic idle capital deployment.', color: 'amber' },
              { label: 'Settlement', title: 'Ethereum Sepolia', desc: 'L1 testnet with USDT (ERC-20) denomination.', color: 'purple' },
              { label: 'Frontend', title: 'React + Vite + Tailwind', desc: 'Real-time dashboard with live data feeds.', color: 'cyan' },
            ].map((t, i) => (
              <div key={i} className="neon-card p-6">
                <div className={`neon-tag tag-${t.color} mb-4 inline-block`}>{t.label}</div>
                <h4 className="font-display text-sm font-bold tracking-wider text-neon-text mb-2">{t.title}</h4>
                <p className="text-sm text-neon-muted">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative z-10 py-24 px-8 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-6 neon-text-cyan">Ready to Deploy?</h2>
          <p className="text-neon-muted mb-10">Enter the live dashboard to see the M-Fi Underwriter in action. Watch AI agents request, receive, and repay loans in real-time.</p>
          <button onClick={onEnterCoreEngine} className="btn-neon btn-solid-cyan py-4 px-12 text-sm">
            Launch Dashboard →
          </button>
        </div>
      </section>

      {/* ═══════════════ REQUEST CREDIT MODAL ═══════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setIsModalOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative neon-card p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neon-cyan/15">
              <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan animate-blink"></div>
              <h3 className="font-display text-sm font-bold text-neon-cyan tracking-widest">REQUEST CREDIT</h3>
              <button onClick={() => setIsModalOpen(false)} className="ml-auto text-neon-muted hover:text-neon-pink transition-colors text-xl">×</button>
            </div>
            <form onSubmit={handleRequestCredit}>
              <div className="mb-4">
                <label className="font-mono text-[10px] text-neon-muted tracking-[0.3em] uppercase block mb-1">Agent Address</label>
                <input
                  type="text"
                  value={agentAddress}
                  onChange={e => setAgentAddress(e.target.value)}
                  placeholder="0x..."
                  className="neon-input"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="font-mono text-[10px] text-neon-muted tracking-[0.3em] uppercase block mb-1">Amount (USDT)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="5.00"
                  className="neon-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 font-display text-xs font-bold tracking-[0.2em] uppercase border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all"
              >
                Submit Request →
              </button>
            </form>
          </div>
        </div>
      )}

      <ProtocolFooter />
    </div>
  );
}
