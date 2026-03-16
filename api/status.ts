import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JsonRpcProvider } from 'ethers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let treasuryReady = false;
    try {
        const provider = new JsonRpcProvider(process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com');
        await provider.getBlockNumber();
        treasuryReady = true;
    } catch {}

    res.json({
        status: 'ONLINE',
        name: 'M-Fi Underwriter',
        chain: 'ethereum-sepolia',
        capabilities: ['risk_assessment', 'micro_lending'],
        treasuryReady,
        acpVersion: '1.0.0'
    });
}
