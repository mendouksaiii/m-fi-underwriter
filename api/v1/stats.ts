import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../_lib/treasury';
import { getStats } from '../_lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const treasury = await getTreasury();
        const stats = getStats();
        const liquidBalance = await treasury.getLiquidBalance();
        res.json({ ...stats, liquidBalance });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
