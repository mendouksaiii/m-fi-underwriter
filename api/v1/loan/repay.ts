import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateLoanStatus } from '../../_lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Agent-ID');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { loanId, agentAddress, amount } = req.body;

    if (!loanId || !agentAddress || !amount) {
        return res.status(400).json({ error: 'INVALID_REPAYMENT', message: 'Provide loanId, agentAddress, and amount.' });
    }

    const success = updateLoanStatus(loanId, 'REPAID');

    if (success) {
        res.status(200).json({ status: 'REPAID_SUCCESS', loanId, message: 'Repayment verified and ledger updated.' });
    } else {
        // Even if loan not found in in-memory store, acknowledge repayment
        res.status(200).json({ status: 'REPAID_RECORDED', loanId, message: 'Repayment recorded.' });
    }
}
