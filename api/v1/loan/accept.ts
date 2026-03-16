import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../../_lib/treasury.js';
import { processCounterOfferAcceptance } from '../../_lib/store.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Agent-ID, X-ACP-Version');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { agentAddress, amount, apy } = req.body;

    if (!agentAddress || !amount || !apy) {
        return res.status(400).json({ error: 'INVALID_ACCEPTANCE', message: 'Provide agentAddress, amount, and apy.' });
    }

    let txHash: string | null = null;
    let message = `${amount} USDT disbursed via Tether WDK.`;

    try {
        const treasury = await getTreasury();
        txHash = await treasury.disburseLoan(agentAddress, Number(amount));
    } catch (err: any) {
        message = `Accepted but on-chain transfer failed: ${err.message}`;
    }

    processCounterOfferAcceptance(agentAddress, Number(amount), Number(apy), txHash);

    res.status(txHash ? 200 : 500).json({
        status: txHash ? 'APPROVED' : 'FAILED_DISBURSEMENT',
        amount,
        txHash,
        message,
    });
}
