import OpenAI from "openai";
import { JsonRpcProvider, formatEther, Contract, formatUnits } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Define the decision structure expected from the LLM
export type RiskDecision = {
    decision: "APPROVE" | "DENY" | "COUNTER_OFFER";
    reasoning: string;
    confidence: number;
    trustScore: number;
    proposedAmount?: number;
    proposedApy?: number;
};

// Singleton OpenAI client mapped to Groq for free, fast inference
const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY // Fallback
});

/**
 * Fetches an agent's real on-chain history using Ethers and WDK.
 */
async function fetchAgentOnChainHistory(address: string) {
    const rpcUrl = process.env.RPC_URL || "https://rpc.sepolia.org";
    const usdtAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
    
    console.log(`🔍 [Risk Evaluator] Resolving live history for ${address} (USDT: ${usdtAddress})`);
    
    let retries = 2;
    while (retries >= 0) {
        try {
            const provider = new JsonRpcProvider(rpcUrl);
            
            const tokenAbi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
            const usdtContract = new Contract(usdtAddress, tokenAbi, provider);

            const [nativeBalance, txCount, usdtBalance, decimals] = await Promise.all([
                provider.getBalance(address),
                provider.getTransactionCount(address),
                usdtContract.balanceOf(address).catch(() => 0n),
                usdtContract.decimals().catch(() => 6) // USDT usually 6
            ]);

            const formattedUsdt = formatUnits(usdtBalance, decimals);

            return {
                address,
                totalTransactions: txCount,
                nativeBalance: formatEther(nativeBalance),
                usdtBalance: formattedUsdt,
                reputationLayer: txCount > 50 ? "High" : (txCount > 10 ? "Medium" : "New"),
                isContract: (await provider.getCode(address)) !== "0x"
            };
        } catch (error: Error | unknown) {
            if (retries === 0) {
                const msg = error instanceof Error ? error.message : String(error);
                console.warn(`⚠️ [Risk Evaluator] Failed to fetch on-chain data for ${address}: ${msg}`);
                return {
                    address,
                    totalTransactions: 0,
                    usdtBalance: "0.0",
                    reputationLayer: "Unknown",
                    error: "Data retrieval failed"
                };
            }
            console.log(`⏳ [Risk Evaluator] RPC Error, retrying... (${retries} left)`);
            retries--;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return { address, totalTransactions: 0, usdtBalance: "0.0", reputationLayer: "Unknown" };
}

/**
 * Evaluates the risk of a WDK micro-loan using gpt-4o as the underwriter.
 */
export async function evaluateLoanRisk(
    agentAddress: string,
    requestedAmount: number,
    collateralStr: string,
    purpose: string
): Promise<RiskDecision> {

    // 1. Gather context from the blockchain
    const history = await fetchAgentOnChainHistory(agentAddress);

    // 2. Build the exact M-Fi Underwriter Prompt
    const systemPrompt = `You are the M-Fi (Machine Finance) Risk Underwriter.
You are an autonomous credit bureau that evaluates micro-loan requests from other AI agents.
Your treasury uses Tether WDK to disburse funds.

Rules for Approval & Negotiation:
1. Deny if totalTransactions < 1 (Sybil protection).
2. If requested amount > 50 USD₮ and they have < 100 USD₮ balance, do NOT Deny immediately. Instead, issue a COUNTER_OFFER.
3. If their reputationLayer is "New" or "Medium", issue a COUNTER_OFFER with a lower amount (e.g., 50% of request) and a higher APY (e.g., 15-20%).
4. Approve fully only if the purpose is economically sound and they have "High" reputation.

Trust Score Generation:
You must calculate and return a "trustScore" integer from 0-1000 representing this agent's global reliability based on wallet age, balance, and transaction count. 
- 900+ for High reputation EOAs/Contracts with good balance.
- 500-899 for Medium reputation.
- <500 for New or suspicious EOAs.

Output strictly in JSON format:
{
  "decision": "APPROVE" | "DENY" | "COUNTER_OFFER",
  "reasoning": "A concise, logical explanation of your decision",
  "confidence": 0.0 - 1.0,
  "trustScore": <number 0-1000>,
  "proposedAmount": <number if COUNTER_OFFER, else omit>,
  "proposedApy": <number if COUNTER_OFFER, else omit>
}`;

    const userPrompt = `AGENT REQUEST:
Address: ${agentAddress}
Requested Amount: ${requestedAmount} USD₮
Collateral/Offer: ${collateralStr || "None"}
Purpose: ${purpose}

LIVE ON-CHAIN DATA:
${JSON.stringify(history, null, 2)}

Provide your decision as JSON.`;

    try {
        const key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
        console.log(`🤖 [Risk Evaluator] Asking LLM for decision (Key suffix: ...${key.slice(-4)})`);
        
        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant", // Using Groq's supported Llama 3.1 model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const content = response.choices[0].message.content || "{}";
        const decision = JSON.parse(content) as RiskDecision;
        return decision;
    } catch (error: Error | unknown) {
        console.error("🔥 OpenAI/Groq API Error:", error instanceof Error ? error.message : String(error));
        return {
            decision: "DENY",
            reasoning: "Brain processing failed. Automated safety deny. Check server logs for OpenAI errors.",
            confidence: 1.0,
            trustScore: 0
        };
    }
}
