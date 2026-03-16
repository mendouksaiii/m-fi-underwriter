import OpenAI from "openai";
import { JsonRpcProvider, formatEther, Contract, formatUnits } from "ethers";

export type RiskDecision = {
    decision: "APPROVE" | "DENY" | "COUNTER_OFFER";
    reasoning: string;
    confidence: number;
    trustScore: number;
    proposedAmount?: number;
    proposedApy?: number;
};

const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY
});

async function fetchAgentOnChainHistory(address: string) {
    const rpcUrl = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const usdtAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
    try {
        const provider = new JsonRpcProvider(rpcUrl);
        const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
        const contract = new Contract(usdtAddress, abi, provider);
        const [nativeBalance, txCount, usdtBalance, decimals] = await Promise.all([
            provider.getBalance(address),
            provider.getTransactionCount(address),
            contract.balanceOf(address).catch(() => 0n),
            contract.decimals().catch(() => 6)
        ]);
        return {
            address, totalTransactions: txCount,
            nativeBalance: formatEther(nativeBalance),
            usdtBalance: formatUnits(usdtBalance, decimals),
            reputationLayer: txCount > 50 ? "High" : (txCount > 10 ? "Medium" : "New"),
            isContract: (await provider.getCode(address)) !== "0x"
        };
    } catch {
        return { address, totalTransactions: 0, usdtBalance: "0.0", reputationLayer: "Unknown" };
    }
}

export async function evaluateLoanRisk(agentAddress: string, requestedAmount: number, collateralStr: string, purpose: string): Promise<RiskDecision> {
    const history = await fetchAgentOnChainHistory(agentAddress);

    const systemPrompt = `You are the M-Fi (Machine Finance) Risk Underwriter.
You are an autonomous credit bureau that evaluates micro-loan requests from other AI agents.
Your treasury uses Tether WDK to disburse funds.

Rules for Approval & Negotiation:
1. Deny if totalTransactions < 1 (Sybil protection).
2. If requested amount > 50 USDT and they have < 100 USDT balance, issue a COUNTER_OFFER.
3. If their reputationLayer is "New" or "Medium", issue a COUNTER_OFFER with lower amount and higher APY.
4. Approve fully only if the purpose is economically sound and they have "High" reputation.

Trust Score: 0-1000 integer. 900+ for High rep, 500-899 Medium, <500 New.

Output strictly in JSON:
{"decision":"APPROVE"|"DENY"|"COUNTER_OFFER","reasoning":"...","confidence":0.0-1.0,"trustScore":<number>,"proposedAmount":<if COUNTER_OFFER>,"proposedApy":<if COUNTER_OFFER>}`;

    const userPrompt = `AGENT REQUEST:
Address: ${agentAddress}
Requested Amount: ${requestedAmount} USDT
Collateral: ${collateralStr || "None"}
Purpose: ${purpose}

LIVE ON-CHAIN DATA:
${JSON.stringify(history, null, 2)}

Provide your decision as JSON.`;

    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.1
        });
        return JSON.parse(response.choices[0].message.content || "{}") as RiskDecision;
    } catch {
        return { decision: "DENY", reasoning: "AI processing failed. Safety deny.", confidence: 1.0, trustScore: 0 };
    }
}
