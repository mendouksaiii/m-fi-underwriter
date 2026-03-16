import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../_lib/treasury';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const treasury = await getTreasury();
        res.json({
            status: 'ONLINE',
            name: 'M-Fi Underwriter',
            chain: 'ethereum-sepolia',
            capabilities: ['risk_assessment', 'micro_lending'],
            treasuryReady: treasury.isReady(),
            acpVersion: '1.0.0'
        });
    } catch {
        res.json({ status: 'ONLINE', name: 'M-Fi Underwriter', chain: 'ethereum-sepolia', treasuryReady: false });
    }
}
