import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../_lib/treasury';
import { saveLoan } from '../_lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { recipientAddress, amount } = req.body;

    if (!recipientAddress || !amount || amount <= 0 || amount > 100) {
        return res.status(400).json({ error: 'INVALID_FAUCET_REQUEST', message: 'Provide a valid recipientAddress and amount (1-100 USDT).' });
    }

    let txHash: string | null = null;
    let message = `${amount} USDT disbursed via Tether WDK.`;

    try {
        const treasury = await getTreasury();
        txHash = await treasury.disburseLoan(recipientAddress, Number(amount));
    } catch (err: any) {
        message = `Faucet approved but on-chain transfer failed: ${err.message}`;
    }

    saveLoan({
        agentAddress: recipientAddress,
        agentId: `human-${recipientAddress.slice(0, 8)}`,
        requestedAmount: Number(amount),
        approvedAmount: Number(amount),
        decision: 'FAUCET',
        reasoning: 'Human faucet request — test USDT disbursed.',
        trustScore: 0,
        txHash,
        purpose: 'Test USDT faucet request',
        status: txHash ? 'ACTIVE' : 'DEFAULT',
    });

    res.status(txHash ? 200 : 500).json({ status: txHash ? 'FAUCET_SUCCESS' : 'FAUCET_FAILED', amount, txHash, message });
}
