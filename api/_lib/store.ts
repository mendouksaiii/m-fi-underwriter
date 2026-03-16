// In-memory store for Vercel serverless functions.
// Data persists across warm invocations but resets on cold starts.
// For production, replace with Vercel KV, Upstash Redis, or a database.

export interface LoanRecord {
    id: string;
    agentAddress: string;
    agentId: string;
    requestedAmount: number;
    approvedAmount: number;
    decision: string;
    reasoning: string;
    trustScore: number;
    txHash: string | null;
    purpose: string;
    proposedApy?: number;
    timestamp: string;
    status: 'ACTIVE' | 'REPAID' | 'DEFAULT';
}

interface StoreData {
    loans: LoanRecord[];
    totalDisbursed: number;
    totalLoansProcessed: number;
}

// Global in-memory store (persists across warm serverless invocations)
const store: StoreData = { loans: [], totalDisbursed: 0, totalLoansProcessed: 0 };

export function saveLoan(loan: Omit<LoanRecord, 'id' | 'timestamp'>): LoanRecord {
    const record: LoanRecord = {
        ...loan,
        id: `MFI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        timestamp: new Date().toISOString(),
    };
    store.loans.unshift(record);
    store.totalLoansProcessed++;
    if (record.decision === 'APPROVED' || record.decision === 'FAUCET') {
        store.totalDisbursed += record.approvedAmount;
    }
    return record;
}

export function getLoans(limit = 50): LoanRecord[] {
    return store.loans.slice(0, limit);
}

export function updateLoanStatus(id: string, status: 'ACTIVE' | 'REPAID' | 'DEFAULT'): boolean {
    const loan = store.loans.find(l => l.id === id);
    if (!loan) return false;
    loan.status = status;
    return true;
}

export function processCounterOfferAcceptance(agentAddress: string, amount: number, apy: number, txHash: string | null): LoanRecord {
    const record: LoanRecord = {
        id: `MFI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        agentAddress,
        agentId: `agent-${agentAddress.slice(0, 8)}`,
        requestedAmount: amount,
        approvedAmount: amount,
        decision: 'APPROVED',
        reasoning: `Counter-offer accepted: ${amount} USDT at ${apy}% APY.`,
        trustScore: 700,
        txHash,
        purpose: 'Counter-offer accepted',
        proposedApy: apy,
        timestamp: new Date().toISOString(),
        status: txHash ? 'ACTIVE' : 'DEFAULT',
    };
    store.loans.unshift(record);
    store.totalLoansProcessed++;
    store.totalDisbursed += record.approvedAmount;
    return record;
}

export function getStats() {
    const loans = store.loans;
    const approved = loans.filter(l => l.decision === 'APPROVED');
    const denied = loans.filter(l => l.decision === 'DENIED');
    const countered = loans.filter(l => l.decision === 'COUNTER_OFFER');
    const defaults = approved.filter(l => l.status === 'DEFAULT');

    return {
        totalVolume: store.totalDisbursed.toFixed(2),
        activeLoans: approved.filter(l => l.status === 'ACTIVE').length,
        totalLoansProcessed: store.totalLoansProcessed,
        approvalRate: loans.length > 0 ? ((approved.length / loans.length) * 100).toFixed(1) : '0.0',
        defaultRate: approved.length > 0 ? ((defaults.length / approved.length) * 100).toFixed(2) : '0.00',
        counterOffers: countered.length,
        denials: denied.length,
    };
}

export function getLeaderboard(limit = 10) {
    const agentMap = new Map<string, { score: number; repaid: number; decisions: number }>();
    for (const loan of store.loans) {
        const key = loan.agentId || loan.agentAddress.slice(0, 10);
        const existing = agentMap.get(key) || { score: 0, repaid: 0, decisions: 0 };
        existing.score = Math.max(existing.score, loan.trustScore || 0);
        existing.decisions++;
        if (loan.status === 'REPAID') existing.repaid++;
        agentMap.set(key, existing);
    }
    return Array.from(agentMap.entries())
        .map(([id, data]) => ({ id, score: data.score, repaid: data.repaid, risk: data.decisions > 0 ? `${((data.repaid / data.decisions) * 100).toFixed(0)}%` : 'N/A' }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
