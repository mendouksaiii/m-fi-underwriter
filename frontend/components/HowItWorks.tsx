import React from 'react';

export function HowItWorks() {
  const steps = [
    { num: '01', label: 'Agent Request', desc: 'AI agent sends a structured loan request via OpenClaw ACP protocol.', color: 'cyan' },
    { num: '02', label: 'AI Underwriting', desc: 'Groq LLaMA 3.1 8B evaluates on-chain telemetry in under 200ms.', color: 'pink' },
    { num: '03', label: 'WDK Settlement', desc: 'Approved loans are signed and broadcast via Tether WDK.', color: 'lime' },
    { num: '04', label: 'Yield & Repay', desc: 'Idle treasury floats are swept into Aave V3 pools for continuous yield.', color: 'amber' },
  ];

  return (
    <section className="animate-fade-in-up stagger-3">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <span className="font-mono text-[10px] text-neon-muted tracking-[0.4em]">// PROTOCOL FLOW</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={i} className={`neon-card p-5 border-t-2 border-neon-${step.color}/40`}>
            <div className={`font-display text-2xl font-bold mb-3 neon-text-${step.color}`}>{step.num}</div>
            <h4 className="font-display text-xs font-bold tracking-widest text-neon-text uppercase mb-2">{step.label}</h4>
            <p className="font-mono text-[11px] text-neon-muted leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}