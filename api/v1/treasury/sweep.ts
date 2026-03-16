import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../../_lib/treasury.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount } = req.body || {};

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'INVALID_SWEEP_AMOUNT', message: 'Provide a valid amount of USDT to sweep to Aave.' });
    }

    try {
        const treasury = await getTreasury();
        const txHash = await treasury.supplyIdleCapital(Number(amount));
        
        res.status(200).json({
            status: 'YIELD_DEPLOYED',
            protocol: 'Aave V3',
            amount: Number(amount),
            txHash,
            message: `${amount} USDT supplied to Aave V3 yield matrix.`
        });
    } catch (err: any) {
        res.status(500).json({
            error: 'YIELD_DEPLOYMENT_FAILED',
            message: err.message
        });
    }
}
