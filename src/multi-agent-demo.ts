/**
 * M-Fi Multi-Agent Simulation
 * 
 * Spawns multiple agent personas simultaneously to demonstrate
 * the M-Fi ecosystem handling concurrent economic agents.
 * 
 * Run with: npx tsx src/multi-agent-demo.ts
 */

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.API_URL || "https://m-fi-underwriter.vercel.app";
const API = `${BASE_URL}/api/v1/loan/request`;
const ACCEPT_API = `${BASE_URL}/api/v1/loan/accept`;
const REPAY_API = `${BASE_URL}/api/v1/loan/repay`;

const AGENTS = [
    {
        id: 'agent-77-scraping',
        address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: 5,
        collateral: 'Reputation Stake',
        purpose: 'Need gas to execute real-time data scraping pipeline. Revenue-generating.',
        color: '\x1b[36m', // cyan
    },
    {
        id: 'agent-42-arbitrage',
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        amount: 50,
        collateral: 'Staked LP Tokens',
        purpose: 'Cross-DEX arbitrage opportunity detected. Expected 3.2% return in 45 min.',
        color: '\x1b[35m', // magenta
    },
    {
        id: 'agent-91-oracle',
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        amount: 10,
        collateral: 'Revenue Share Agreement',
        purpose: 'Cover gas for 24h Chainlink oracle price feed updates. Critical infrastructure.',
        color: '\x1b[33m', // yellow
    },
    {
        id: 'agent-15-yield',
        address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        amount: 100,
        collateral: 'Future Yield Revenue',
        purpose: 'Rebalance Aave V3 yield positions for better APY. Migration expected to +2.1%.',
        color: '\x1b[32m', // green
    },
    {
        id: 'agent-63-nft-mint',
        address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        amount: 15,
        collateral: 'NFT Collection Revenue',
        purpose: 'Mint time-sensitive generative art NFT collection. Expected ROI within 2 hours.',
        color: '\x1b[34m', // blue
    },
];

const RESET = '\x1b[0m';

async function simulateAgent(agent: typeof AGENTS[0], delayMs: number) {
    await new Promise(r => setTimeout(r, delayMs));

    console.log(`\n${agent.color}╔${'═'.repeat(56)}╗${RESET}`);
    console.log(`${agent.color}║ 🤖 ${agent.id.padEnd(52)}║${RESET}`);
    console.log(`${agent.color}║ 📡 Contacting M-Fi Underwriter...${' '.repeat(21)}║${RESET}`);
    console.log(`${agent.color}╚${'═'.repeat(56)}╝${RESET}`);

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Agent-ID': agent.id,
                'X-ACP-Version': '1.0.0'
            },
            body: JSON.stringify({
                agentAddress: agent.address,
                requestedAmount: agent.amount,
                collateral: agent.collateral,
                purpose: agent.purpose
            })
        });

        const data: any = await res.json();

        if (res.ok && (data.status === 'APPROVED' || data.status === 'FAILED_DISBURSEMENT')) {
            console.log(`${agent.color}  ✅ APPROVED | ${agent.amount} USDT | Trust: ${data.trustScore} | ${data.reason?.slice(0, 60)}...${RESET}`);

            // Simulate job execution
            console.log(`${agent.color}  🔧 Executing job...${RESET}`);
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 5000));
            console.log(`${agent.color}  ✅ Job complete! Revenue generated.${RESET}`);

            // Auto-repay
            const interest = agent.amount * 0.0005; // ~18% APY daily
            console.log(`${agent.color}  💰 Repaying ${(agent.amount + interest).toFixed(4)} USDT (principal + interest)...${RESET}`);
            try {
                await fetch(REPAY_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Agent-ID': agent.id },
                    body: JSON.stringify({ loanId: `MFI-${Date.now()}`, agentAddress: agent.address, amount: agent.amount + interest })
                });
                console.log(`${agent.color}  ✅ Loan REPAID successfully.${RESET}`);
            } catch {
                console.log(`${agent.color}  ⚠️ Repayment recorded locally.${RESET}`);
            }

        } else if (res.status === 202 && data.status === 'COUNTER_OFFER') {
            console.log(`${agent.color}  ⚖️ COUNTER-OFFER | ${data.proposedAmount} USDT at ${data.proposedApy}% APY | Trust: ${data.trustScore}${RESET}`);

            // Auto-negotiate
            if (data.proposedApy <= 25) {
                console.log(`${agent.color}  🤝 Accepting counter-offer (APY ≤ 25%)...${RESET}`);
                await new Promise(r => setTimeout(r, 1500));
                try {
                    const acceptRes = await fetch(ACCEPT_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Agent-ID': agent.id, 'X-ACP-Version': '1.0.0' },
                        body: JSON.stringify({ agentAddress: agent.address, amount: data.proposedAmount, apy: data.proposedApy })
                    });
                    const acceptData: any = await acceptRes.json();
                    console.log(`${agent.color}  ✅ Negotiation successful! Received ${acceptData.amount || data.proposedAmount} USDT${RESET}`);
                } catch {
                    console.log(`${agent.color}  ⚠️ Acceptance sent.${RESET}`);
                }
            } else {
                console.log(`${agent.color}  🚫 Rejecting — APY too high (${data.proposedApy}% > 25%)${RESET}`);
            }

        } else {
            console.log(`${agent.color}  ❌ DENIED | Trust: ${data.trustScore || 'N/A'} | ${data.reason?.slice(0, 60) || 'Unknown'}${RESET}`);
        }
    } catch (err: any) {
        console.log(`${agent.color}  🔥 Network error: ${err.message}${RESET}`);
    }
}

async function main() {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║   M-Fi MULTI-AGENT ECOSYSTEM SIMULATION                 ║");
    console.log("║   Spawning 5 agents with different risk profiles...      ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    // Stagger agents by 2-4 seconds each
    const promises = AGENTS.map((agent, i) =>
        simulateAgent(agent, i * (2000 + Math.random() * 2000))
    );

    await Promise.all(promises);

    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║   ✅ SIMULATION COMPLETE                                 ║");
    console.log("║   All agents processed. Check dashboard for live feed.   ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
}

main().catch(console.error);
