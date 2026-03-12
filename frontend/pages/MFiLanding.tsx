import React, { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { LiveDashboard } from '../components/LiveDashboard';
import { HowItWorks } from '../components/HowItWorks';
import { TransactionFeed } from '../components/TransactionFeed';
import { AgentLeaderboard } from '../components/AgentLeaderboard';
import { AgentLendingFeed } from '../components/AgentLendingFeed';
import { HumanFaucet } from '../components/HumanFaucet';
import { ProtocolFooter } from '../components/ProtocolFooter';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { MFiTerminal } from '../components/MFiTerminal';

export function MFiLanding() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neon-bg text-neon-text flex flex-col relative font-sans">
      <AnimatedBackground />

      <HeroSection onAddressChange={setConnectedAddress} />

      <main className="flex-grow p-6 md:p-8 lg:p-12 max-w-[1440px] mx-auto w-full space-y-10 relative z-10">
        <LiveDashboard />

        {/* Live Lending Activity Feed */}
        <AgentLendingFeed />

        <div className="neon-divider"></div>

        <HowItWorks />

        <div className="neon-divider"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MFiTerminal />
            <TransactionFeed />
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Human USDT Faucet */}
            <HumanFaucet connectedAddress={connectedAddress} />
            <AgentLeaderboard />
          </div>
        </div>
      </main>

      <ProtocolFooter />
    </div>
  );
}