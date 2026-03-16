import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTreasury } from '../../_lib/treasury';
import { evaluateLoanRisk } from '../../_lib/risk-evaluator';
import { saveLoan } from '../../_lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Agent-ID, X-ACP-Version');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { agentAddress, requestedAmount, collateral, purpose } = req.body;
    const agentId = (req.headers['x-agent-id'] as string) || agentAddress?.slice(0, 10) || 'unknown';

    if (!agentAddress || !requestedAmount) {
        return res.status(400).json({ error: 'INCOMPLETE_REQUEST', message: 'Missing agentAddress or requestedAmount' });
    }

    try {
        const riskDecision = await evaluateLoanRisk(agentAddress, Number(requestedAmount), collateral, purpose);

        if (riskDecision.decision === 'DENY') {
            saveLoan({ agentAddress, agentId, requestedAmount: Number(requestedAmount), approvedAmount: 0, decision: 'DENIED', reasoning: riskDecision.reasoning, trustScore: riskDecision.trustScore, txHash: null, purpose: purpose || '', status: 'DEFAULT' });
            return res.status(403).json({ status: 'DENIED', reason: riskDecision.reasoning, confidence: riskDecision.confidence, trustScore: riskDecision.trustScore });
        }

        if (riskDecision.decision === 'COUNTER_OFFER') {
            saveLoan({ agentAddress, agentId, requestedAmount: Number(requestedAmount), approvedAmount: riskDecision.proposedAmount || 0, decision: 'COUNTER_OFFER', reasoning: riskDecision.reasoning, trustScore: riskDecision.trustScore, txHash: null, purpose: purpose || '', proposedApy: riskDecision.proposedApy, status: 'ACTIVE' });
            return res.status(202).json({ status: 'COUNTER_OFFER', proposedAmount: riskDecision.proposedAmount, proposedApy: riskDecision.proposedApy, reason: riskDecision.reasoning, confidence: riskDecision.confidence, trustScore: riskDecision.trustScore, message: "Counter-offer issued. Reply to accept." });
        }

        let txHash: string | null = null;
        let status: 'ACTIVE' | 'DEFAULT' = 'ACTIVE';
        let message = "Success. Funds disbursed via Tether WDK.";

        try {
            const treasury = await getTreasury();
            txHash = await treasury.disburseLoan(agentAddress, Number(requestedAmount));
        } catch (err: any) {
            message = `Approved but disbursement failed: ${err.message}`;
            status = 'DEFAULT';
        }

        saveLoan({ agentAddress, agentId, requestedAmount: Number(requestedAmount), approvedAmount: Number(requestedAmount), decision: 'APPROVED', reasoning: riskDecision.reasoning, trustScore: riskDecision.trustScore, txHash, purpose: purpose || '', status });
        res.status(txHash ? 200 : 500).json({ status: txHash ? 'APPROVED' : 'FAILED_DISBURSEMENT', amount: requestedAmount, txHash, reason: riskDecision.reasoning, confidence: riskDecision.confidence, trustScore: riskDecision.trustScore, message });

    } catch (err: any) {
        res.status(500).json({ error: 'INTERNAL_UNDERWRITER_ERROR', message: err.message });
    }
}
