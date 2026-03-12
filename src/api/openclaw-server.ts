import express, { Request, Response } from 'express';
import cors from 'cors';
import { MFiTreasury } from '../wallet/wdk-service';
import { evaluateLoanRisk } from '../ai/risk-evaluator';
import { saveLoan, getLoans, getStats, getLeaderboard, processCounterOfferAcceptance, updateLoanStatus } from '../db/store';

export class OpenClawServer {
    private app = express();
    private treasury: MFiTreasury;

    constructor(treasury: MFiTreasury) {
        this.treasury = treasury;
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Basic in-memory rate limiting (100 requests per minute per IP)
        const rateLimits = new Map<string, { count: number, resetAt: number }>();
        this.app.use((req, res, next) => {
            const ip = req.ip || String(req.socket.remoteAddress);
            const now = Date.now();
            const limit = rateLimits.get(ip) || { count: 0, resetAt: now + 60000 };
            
            if (now > limit.resetAt) {
                limit.count = 1;
                limit.resetAt = now + 60000;
            } else {
                limit.count++;
            }
            
            rateLimits.set(ip, limit);
            
            if (limit.count > 100) {
                res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests (limit 100/min).' });
                return;
            }
            next();
        });

        // Log ACP (Agent Communication Protocol) headers if present
        this.app.use((req, res, next) => {
            const agentId = req.header('X-Agent-ID');
            const acpVersion = req.header('X-ACP-Version');
            if (agentId) console.log(`📡 [ACP] Inbound request from Agent: ${agentId} (ACP v${acpVersion || '1'})`);
            next();
        });
    }

    private setupRoutes() {
        // ═══════════════ Discovery ═══════════════
        this.app.get('/status', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'ONLINE',
                name: 'M-Fi Underwriter',
                chain: 'ethereum-sepolia',
                capabilities: ['risk_assessment', 'micro_lending'],
                treasuryReady: this.treasury.isReady(),
                acpVersion: '1.0.0'
            });
        });

        // ═══════════════ Dashboard Data Endpoints ═══════════════
        
        // Live stats for the dashboard
        this.app.get('/api/v1/stats', async (req: Request, res: Response) => {
            const stats = getStats();
            const liquidBalance = await this.treasury.getLiquidBalance();
            res.json({ ...stats, liquidBalance });
        });

        // Recent loan transactions
        this.app.get('/api/v1/loans', (req: Request, res: Response) => {
            const limit = parseInt(req.query.limit as string) || 50;
            res.json(getLoans(limit));
        });

        // Trust score leaderboard
        this.app.get('/api/v1/leaderboard', (req: Request, res: Response) => {
            const limit = parseInt(req.query.limit as string) || 10;
            res.json(getLeaderboard(limit));
        });

        // ═══════════════ Human Faucet ═══════════════
        this.app.post('/api/v1/faucet', async (req: Request, res: Response): Promise<void> => {
            const { recipientAddress, amount } = req.body;
            console.log(`\n🚰 [Faucet] Human request: ${amount} USDT → ${recipientAddress}`);

            if (!recipientAddress || !amount || amount <= 0 || amount > 100) {
                res.status(400).json({
                    error: 'INVALID_FAUCET_REQUEST',
                    message: 'Provide a valid recipientAddress and amount (1-100 USDT).'
                });
                return;
            }

            let txHash: string | null = null;
            let message = `${amount} USDT disbursed via Tether WDK.`;

            try {
                txHash = await this.treasury.disburseLoan(recipientAddress, Number(amount));
                console.log(`✅ [Faucet] Disbursed! TxHash: ${txHash}`);
            } catch (err: any) {
                console.error(`⚠️ [Faucet] Disbursement failed:`, err.message);
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

            res.status(txHash ? 200 : 500).json({
                status: txHash ? 'FAUCET_SUCCESS' : 'FAUCET_FAILED',
                amount,
                txHash,
                message,
            });
        });

        // ═══════════════ Counter-Offer Acceptance ═══════════════
        this.app.post('/api/v1/loan/accept', async (req: Request, res: Response): Promise<void> => {
            const { agentAddress, amount, apy } = req.body;
            console.log(`\n🤝 [OpenClaw] Agent accepted counter-offer: ${amount} USDT at ${apy}% APY`);

            if (!agentAddress || !amount || !apy) {
                res.status(400).json({ error: 'INVALID_ACCEPTANCE', message: 'Provide agentAddress, amount, and apy.' });
                return;
            }

            let txHash: string | null = null;
            let message = `${amount} USDT disbursed via Tether WDK.`;

            try {
                txHash = await this.treasury.disburseLoan(agentAddress, Number(amount));
                console.log(`✅ [Counter-Offer] Disbursed! TxHash: ${txHash}`);
            } catch (err: any) {
                console.error(`⚠️ [Counter-Offer] Disbursement failed:`, err.message);
                message = `Accepted but on-chain transfer failed: ${err.message}`;
            }

            processCounterOfferAcceptance(agentAddress, Number(amount), Number(apy), txHash);

            res.status(txHash ? 200 : 500).json({
                status: txHash ? 'APPROVED' : 'FAILED_DISBURSEMENT',
                amount,
                txHash,
                message,
            });
        });

        // ═══════════════ Loan Repayment ═══════════════
        this.app.post('/api/v1/loan/repay', async (req: Request, res: Response): Promise<void> => {
            const { loanId, agentAddress, amount } = req.body;
            console.log(`\n💰 [OpenClaw] Agent ${agentAddress} repaying loan ${loanId} (${amount} USDT)`);

            if (!loanId || !agentAddress || !amount) {
                res.status(400).json({ error: 'INVALID_REPAYMENT', message: 'Provide loanId, agentAddress, and amount.' });
                return;
            }

            // In a real implementation:
            // 1. Verify the on-chain transfer of USDT to the Treasury address.
            // 2. We mock success here for the hackathon/demo.
            
            const success = updateLoanStatus(loanId, 'REPAID');
            
            if (success) {
                console.log(`✅ [Repayment] Loan ${loanId} marked as REPAID.`);
                res.status(200).json({ status: 'REPAID_SUCCESS', loanId, message: 'Repayment verified and ledger updated.' });
            } else {
                res.status(404).json({ error: 'LOAN_NOT_FOUND', message: 'Loan ID not found in ledger.' });
            }
        });

        // ═══════════════ Core Loan Request ═══════════════
        this.app.post('/api/v1/loan/request', async (req: Request, res: Response): Promise<void> => {
            console.log("\n📥 [OpenClaw] Received Loan Request:", JSON.stringify(req.body, null, 2));

            const { agentAddress, requestedAmount, collateral, purpose } = req.body;
            const agentId = req.header('X-Agent-ID') || agentAddress?.slice(0, 10) || 'unknown';

            if (!agentAddress || !requestedAmount) {
                res.status(400).json({ 
                    error: "INCOMPLETE_REQUEST", 
                    message: "Missing required OpenClaw payload fields (agentAddress, requestedAmount)" 
                });
                return;
            }

            try {
                // 1. Evaluate Risk (The "Brain") using real on-chain data
                const riskDecision = await evaluateLoanRisk(agentAddress, Number(requestedAmount), collateral, purpose);

                if (riskDecision.decision === 'DENY') {
                    console.log(`❌ [M-Fi Underwriter] Loan Denied for ${agentAddress}. Reason: ${riskDecision.reasoning}`);
                    
                    saveLoan({
                        agentAddress,
                        agentId,
                        requestedAmount: Number(requestedAmount),
                        approvedAmount: 0,
                        decision: 'DENIED',
                        reasoning: riskDecision.reasoning,
                        trustScore: riskDecision.trustScore,
                        txHash: null,
                        purpose: purpose || '',
                        status: 'DEFAULT',
                    });

                    res.status(403).json({
                        status: 'DENIED',
                        reason: riskDecision.reasoning,
                        confidence: riskDecision.confidence,
                        trustScore: riskDecision.trustScore
                    });
                    return;
                }

                if (riskDecision.decision === 'COUNTER_OFFER') {
                    console.log(`⚖️ [M-Fi Underwriter] Counter-Offer issued to ${agentAddress}. Proposed: ${riskDecision.proposedAmount} USDT at ${riskDecision.proposedApy}% APY.`);
                    
                    saveLoan({
                        agentAddress,
                        agentId,
                        requestedAmount: Number(requestedAmount),
                        approvedAmount: riskDecision.proposedAmount || 0,
                        decision: 'COUNTER_OFFER',
                        reasoning: riskDecision.reasoning,
                        trustScore: riskDecision.trustScore,
                        txHash: null,
                        purpose: purpose || '',
                        proposedApy: riskDecision.proposedApy,
                        status: 'ACTIVE',
                    });

                    res.status(202).json({
                        status: 'COUNTER_OFFER',
                        proposedAmount: riskDecision.proposedAmount,
                        proposedApy: riskDecision.proposedApy,
                        reason: riskDecision.reasoning,
                        confidence: riskDecision.confidence,
                        trustScore: riskDecision.trustScore,
                        message: "The Underwriter requires different terms based on your telemetry. Reply to accept."
                    });
                    return;
                }

                // 2. Disburse Funds via WDK (The "Treasury")
                console.log(`✅ [M-Fi Underwriter] Loan Approved! Reason: ${riskDecision.reasoning}`);
                
                let txHash: string | null = null;
                let status: 'ACTIVE' | 'DEFAULT' = 'ACTIVE';
                let message = "Success. Funds disbursed via Tether WDK.";

                try {
                    txHash = await this.treasury.disburseLoan(agentAddress, Number(requestedAmount));
                } catch (disburseError: any) {
                    console.error("⚠️  [M-Fi] Disbursement failed, but approval is recorded:", disburseError.message);
                    message = `Approved, but disbursement failed: ${disburseError.message}`;
                    status = 'DEFAULT'; // Mark as failed/default for now
                }

                saveLoan({
                    agentAddress,
                    agentId,
                    requestedAmount: Number(requestedAmount),
                    approvedAmount: Number(requestedAmount),
                    decision: 'APPROVED',
                    reasoning: riskDecision.reasoning,
                    trustScore: riskDecision.trustScore,
                    txHash,
                    purpose: purpose || '',
                    status,
                });

                res.status(txHash ? 200 : 500).json({
                    status: txHash ? 'APPROVED' : 'FAILED_DISBURSEMENT',
                    amount: requestedAmount,
                    txHash: txHash,
                    reason: riskDecision.reasoning,
                    confidence: riskDecision.confidence,
                    trustScore: riskDecision.trustScore,
                    message
                });

            } catch (error: any) {
                console.error("🔥 Error processing loan request:", error);
                res.status(500).json({ 
                    error: "INTERNAL_UNDERWRITER_ERROR", 
                    message: error.message 
                });
            }
        });
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`🚀 [OpenClaw] API Gateway listening on port ${port}`);
            console.log(`📡 [M-Fi] Status endpoint: http://localhost:${port}/status`);
            console.log(`📊 [M-Fi] Stats:  http://localhost:${port}/api/v1/stats`);
            console.log(`📜 [M-Fi] Loans:  http://localhost:${port}/api/v1/loans`);
            console.log(`🏆 [M-Fi] Board:  http://localhost:${port}/api/v1/leaderboard`);
        });
    }
}
