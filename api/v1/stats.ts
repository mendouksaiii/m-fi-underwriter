import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Fetch USDT balance directly via ethers (no WDK needed for read-only)
        const rpcUrl = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
        const usdtAddress = process.env.USDT_TOKEN_ADDRESS || '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06';
        const treasuryAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        let liquidBalance = '0.00';
        try {
            const provider = new JsonRpcProvider(rpcUrl);
            const abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
            const contract = new Contract(usdtAddress, abi, provider);
            const [balance, decimals] = await Promise.all([
                contract.balanceOf(treasuryAddress),
                contract.decimals().catch(() => 6)
            ]);
            liquidBalance = formatUnits(balance, decimals);
        } catch (balErr) {
            console.error('[Stats] Balance fetch failed:', balErr);
        }

        // Import store (in-memory, light)
        const { getStats } = await import('../_lib/store.js');
        const stats = getStats();

        res.json({ ...stats, liquidBalance });
    } catch (err: any) {
        console.error('[Stats] Error:', err);
        res.status(500).json({ error: err.message });
    }
}
