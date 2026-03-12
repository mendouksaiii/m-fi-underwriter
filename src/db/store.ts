import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════
// M-Fi Persistent Store — JSON-file-backed loan ledger
// ═══════════════════════════════════════════════════

export interface LoanRecord {
    id: string;
    agentAddress: string;
    agentId: string;
    requestedAmount: number;
    approvedAmount: number;
    decision: 'APPROVED' | 'DENIED' | 'COUNTER_OFFER' | 'FAUCET';
    reasoning: string;
    trustScore: number;
    txHash: string | null;
    purpose: string;
    proposedApy?: number;
    timestamp: string;
    status: 'ACTIVE' | 'REPAID' | 'DEFAULT';
}

export interface StoreData {
    loans: LoanRecord[];
    totalDisbursed: number;
    totalLoansProcessed: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'loans.json');

function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadStore(): StoreData {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
        const empty: StoreData = { loans: [], totalDisbursed: 0, totalLoansProcessed: 0 };
        fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2));
        return empty;
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw) as StoreData;
    } catch {
        return { loans: [], totalDisbursed: 0, totalLoansProcessed: 0 };
    }
}

function saveStore(data: StoreData): void {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ═══════════════ Public API ═══════════════

/**
 * Record a loan decision to the persistent store.
 */
export function saveLoan(loan: Omit<LoanRecord, 'id' | 'timestamp'>): LoanRecord {
    const store = loadStore();
    const record: LoanRecord = {
        ...loan,
        id: `MFI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        timestamp: new Date().toISOString(),
    };
    store.loans.unshift(record); // newest first
    store.totalLoansProcessed++;
    if (record.decision === 'APPROVED' || record.decision === 'FAUCET') {
        store.totalDisbursed += record.approvedAmount;
    }
    saveStore(store);
    console.log(`📀 [Store] Loan ${record.id} persisted (${record.decision})`);
    return record;
}

/**
 * Get all loans, newest first.
 */
export function getLoans(limit = 50): LoanRecord[] {
    const store = loadStore();
    return store.loans.slice(0, limit);
}

/**
 * Update the status of an existing loan (e.g., to REPAID).
 */
export function updateLoanStatus(id: string, status: 'ACTIVE' | 'REPAID' | 'DEFAULT'): boolean {
    const store = loadStore();
    const loan = store.loans.find(l => l.id === id);
    if (!loan) return false;
    
    loan.status = status;
    saveStore(store);
    console.log(`📀 [Store] Loan ${id} status updated to ${status}`);
    return true;
}

/**
 * Accept a counter offer by creating a new approved loan record.
 */
export function processCounterOfferAcceptance(agentAddress: string, amount: number, apy: number, txHash: string | null): LoanRecord {
    const store = loadStore();
    const record: LoanRecord = {
        id: `MFI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        agentAddress,
        agentId: `agent-${agentAddress.slice(0, 8)}`,
        requestedAmount: amount,
        approvedAmount: amount,
        decision: 'APPROVED',
        reasoning: `Counter-offer terms accepted: ${amount} USDT at ${apy}% APY.`,
        trustScore: 700, // Default for counter-offer acceptance
        txHash,
        purpose: 'Counter-offer accepted',
        proposedApy: apy,
        timestamp: new Date().toISOString(),
        status: txHash ? 'ACTIVE' : 'DEFAULT',
    };
    
    store.loans.unshift(record); // newest first
    store.totalLoansProcessed++;
    store.totalDisbursed += record.approvedAmount;
    saveStore(store);
    
    console.log(`📀 [Store] Counter-offer accepted, Loan ${record.id} persisted`);
    return record;
}

/**
 * Compute live dashboard stats from the ledger.
 */
export function getStats() {
    const store = loadStore();
    const loans = store.loans;
    const approved = loans.filter(l => l.decision === 'APPROVED');
    const denied = loans.filter(l => l.decision === 'DENIED');
    const countered = loans.filter(l => l.decision === 'COUNTER_OFFER');
    const defaults = approved.filter(l => l.status === 'DEFAULT');

    return {
        totalVolume: store.totalDisbursed.toFixed(2),
        activeLoans: approved.filter(l => l.status === 'ACTIVE').length,
        totalLoansProcessed: store.totalLoansProcessed,
        approvalRate: loans.length > 0
            ? ((approved.length / loans.length) * 100).toFixed(1)
            : '0.0',
        defaultRate: approved.length > 0
            ? ((defaults.length / approved.length) * 100).toFixed(2)
            : '0.00',
        counterOffers: countered.length,
        denials: denied.length,
    };
}

/**
 * Aggregate trust scores into a leaderboard from unique agents.
 */
export function getLeaderboard(limit = 10) {
    const store = loadStore();
    const agentMap = new Map<string, { score: number; repaid: number; decisions: number }>();

    for (const loan of store.loans) {
        const key = loan.agentId || loan.agentAddress.slice(0, 10);
        const existing = agentMap.get(key) || { score: 0, repaid: 0, decisions: 0 };
        // Use the highest trust score seen for this agent
        existing.score = Math.max(existing.score, loan.trustScore || 0);
        existing.decisions++;
        if (loan.status === 'REPAID') existing.repaid++;
        agentMap.set(key, existing);
    }

    const entries = Array.from(agentMap.entries())
        .map(([id, data]) => ({
            id,
            score: data.score,
            repaid: data.repaid,
            risk: data.decisions > 0
                ? `${((data.repaid / data.decisions) * 100).toFixed(0)}%`
                : 'N/A'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return entries;
}
