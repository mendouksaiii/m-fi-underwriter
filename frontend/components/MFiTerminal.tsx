import React, { useState, useEffect, useRef } from 'react';

export function MFiTerminal() {
  const [lines, setLines] = useState<{ text: string; type: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const logSequence = [
    { text: '$ boot --node mfi-underwriter --mode autonomous', type: 'cmd' },
    { text: '✓ WDK Treasury initialized at 0xf39F...2266', type: 'ok' },
    { text: '✓ Aave V3 Yield Matrix online', type: 'ok' },
    { text: '✓ OpenClaw API Gateway → port 3000', type: 'ok' },
    { text: '✓ Groq LLaMA 3.1 8B risk engine calibrated', type: 'ok' },
    { text: '⚠ Gas reserves low — monitoring threshold', type: 'warn' },
    { text: '', type: 'blank' },
    { text: '$ listen --protocol acp --channel agent-loans', type: 'cmd' },
    { text: '📡 Inbound: agent-77-scraping requesting 0.05 USDT', type: 'ok' },
    { text: '🔍 Evaluating on-chain telemetry...', type: 'muted' },
    { text: '✓ Decision: APPROVED | Trust Score: 950 | Conf: 95%', type: 'ok' },
    { text: '💸 Disbursed 0.05 USDT → 0x7099...79C8', type: 'ok' },
    { text: '✓ TxHash: 0x9524...a26e settled on Sepolia', type: 'ok' },
    { text: '', type: 'blank' },
    { text: '$ status --yield', type: 'cmd' },
    { text: '🌾 Idle capital auto-routed to Aave V3 pool', type: 'ok' },
    { text: '✓ Supply APY: 3.2% | Earning yield on idle USDT', type: 'ok' },
    { text: '⚠ Monitoring for withdrawal triggers', type: 'warn' },
    { text: '', type: 'blank' },
    { text: '$ listen --awaiting-requests', type: 'cmd' },
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logSequence.length) {
        setLines(prev => [...prev, logSequence[i]]);
        i++;
      } else {
        // Loop: restart after a pause
        setTimeout(() => {
          setLines([]);
          i = 0;
        }, 3000);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const typeClass = (type: string) => {
    switch(type) {
      case 'cmd': return 't-cmd';
      case 'ok': return 't-ok';
      case 'warn': return 't-warn';
      case 'err': return 't-err';
      default: return 't-muted';
    }
  };

  return (
    <div className="neon-card animate-fade-in-up stagger-2 overflow-hidden">
      {/* Terminal Header with traffic lights */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
        <div className="w-[8px] h-[8px] rounded-full bg-[#ff5f57]"></div>
        <div className="w-[8px] h-[8px] rounded-full bg-[#ffbd2e]"></div>
        <div className="w-[8px] h-[8px] rounded-full bg-neon-lime shadow-neon-lime"></div>
        <span className="ml-auto font-mono text-[10px] text-neon-muted tracking-[0.3em]">M-FI — SYSTEM LOG</span>
      </div>

      {/* Terminal Body */}
      <div 
        ref={terminalRef}
        className="neon-terminal p-5 max-h-[300px] overflow-y-auto border-none border-t-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        {lines.map((line, i) => (
          <div key={i} className={line.type === 'blank' ? 'h-4' : ''}>
            {line.type === 'cmd' ? (
              <div><span className="t-muted">$</span> <span className="t-cmd">{line.text.replace('$ ', '')}</span></div>
            ) : line.type !== 'blank' ? (
              <div className={typeClass(line.type)}>{line.text}</div>
            ) : null}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="mt-1">
          <span className="t-muted">$</span>{' '}
          <span className="inline-block w-2 h-3.5 bg-neon-cyan animate-blink shadow-neon-cyan align-middle"></span>
        </div>
      </div>
    </div>
  );
}
