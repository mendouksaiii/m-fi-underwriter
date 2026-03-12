import fetch from 'node-fetch';

const UNDERWRITER_API = "http://localhost:3000/api/v1/loan/request";
const ACCEPT_API = "http://localhost:3000/api/v1/loan/accept";

async function requestLoan() {
    console.log("🤖 [Stranded Agent] Running critical data scraping job...");
    console.log("⚠️ [Stranded Agent] ERROR: Insufficient Gas for execution.");
    console.log("📡 [Stranded Agent] Contacting M-Fi Underwriter via OpenClaw ACP...");

    const payload = {
        agentAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Standard test address 2
        requestedAmount: 0.05, // Requesting a small amount for test
        collateral: "Reputation Stake",
        purpose: "Urgent need for native gas to complete arbitrage loop. high priority."
    };

    try {
        const response = await fetch(UNDERWRITER_API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Agent-ID': 'agent-77-scraping',
                'X-ACP-Version': '1.0.0'
            },
            body: JSON.stringify(payload)
        });

        const data: any = await response.json();

        if (response.ok && (data.status === 'APPROVED' || data.status === 'FAILED_DISBURSEMENT')) {
            console.log(`\n✅ [Stranded Agent] LOAN APPROVED!`);
            console.log(`💬 Reason: ${data.reason}`);
            console.log(`📊 Trust Score: ${data.trustScore}`);
            console.log(`📉 Confidence: ${(data.confidence * 100).toFixed(0)}%`);
            if (data.txHash) {
                console.log(`💸 Received ${data.amount} USDT.`);
                console.log(`🔗 TxHash: ${data.txHash}`);
                console.log("🚀 [Stranded Agent] Resuming critical job with new gas...");
            } else {
                console.log(`⚠️ Disbursement failed: ${data.message}`);
            }
        } else if (response.status === 202 && data.status === 'COUNTER_OFFER') {
            console.log(`\n⚖️ [Stranded Agent] COUNTER-OFFER RECEIVED`);
            console.log(`💬 Reason: ${data.reason}`);
            console.log(`📉 Terms: ${data.proposedAmount} USDT at ${data.proposedApy}% APY`);
            console.log(`📊 Trust Score: ${data.trustScore}`);
            
            // Autonomous decision to accept
            if (data.proposedApy <= 25) {
                console.log(`\n🤝 [Stranded Agent] Evaluated terms. APY is acceptable (< 25%). Sending acceptance...`);
                setTimeout(() => acceptCounterOffer(data.proposedAmount, data.proposedApy), 2000);
            } else {
                console.log(`\n🚫 [Stranded Agent] Evaluated terms. APY is too high. Rejecting counter-offer.`);
            }
        } else {
            console.log(`\n❌ [Stranded Agent] LOAN DENIED`);
            console.log(`💬 Reason: ${data.reason}`);
            console.log(`📉 Confidence: ${((data.confidence || 0) * 100).toFixed(0)}%`);
            console.log(`📊 Trust Score: ${data.trustScore || 'N/A'}`);
        }
    } catch (error) {
        console.error("🔥 Failed to contact underwriter:", error);
    }
}

async function acceptCounterOffer(agreedAmount: number, agreedApy: number) {
    console.log(`\n📡 [Stranded Agent] Formally accepting COUNTER_OFFER of ${agreedAmount} USDT...`);
    
    const payload = {
        agentAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        amount: agreedAmount,
        apy: agreedApy,
    };

    try {
        const response = await fetch(ACCEPT_API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Agent-ID': 'agent-77-scraping',
                'X-ACP-Version': '1.0.0'
            },
            body: JSON.stringify(payload)
        });

        const data: any = await response.json();
        
        if (response.ok && data.status === 'APPROVED') {
            console.log(`\n✅ [Stranded Agent] NEGOTIATION SUCCESSFUL!`);
            console.log(`💸 Received ${data.amount} USDT.`);
            console.log(`🔗 TxHash: ${data.txHash}`);
            console.log("🚀 [Stranded Agent] Resuming critical job with new gas...");
        } else {
            console.log(`\n❌ [Stranded Agent] Acceptance failed: ${data.message || data.reason}`);
        }
    } catch (error) {
         console.error("🔥 Failed to accept counter-offer:", error);
    }
}

// Execute
requestLoan();
