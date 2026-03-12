import WDK from "@tetherto/wdk";
import WalletManagerEvm, { WalletAccountEvm } from "@tetherto/wdk-wallet-evm";
import AaveProtocolEvm from "@tetherto/wdk-protocol-lending-aave-evm";
import { parseUnits, JsonRpcProvider, Contract, formatUnits } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

export class MFiTreasury {
    private wdk: WDK;
    private defaultAccount!: WalletAccountEvm;
    private aaveProtocol!: AaveProtocolEvm;
    private initialized = false;

    constructor() {
        // M-Fi Underwriter seed phrase should ideally be in a secure vault
        const seed = process.env.UNDERWRITER_SEED || "test test test test test test test test test test test junk";

        // Initialize WDK with the seed
        this.wdk = new WDK(seed);
    }

    public async initialize(): Promise<void> {
        try {
            console.log("🛠️ Registering EVM Wallet Manager...");
            
            // Register an EVM compatible chain (Ethereum Sepolia testnet)
            const evmConfig = {
                provider: process.env.RPC_URL || "https://rpc.sepolia.org",
            };

            this.wdk.registerWallet('ethereum-sepolia', WalletManagerEvm, evmConfig);

            // Fetch the primary account (index 0) for the underwriter
            this.defaultAccount = await this.wdk.getAccount('ethereum-sepolia', 0) as unknown as WalletAccountEvm;
            
            // Initialize the Aave V3 MCP Toolkit Agent Skill
            this.aaveProtocol = new AaveProtocolEvm(this.defaultAccount);
            
            const address = await this.defaultAccount.getAddress();
            console.log(`✅ WDK Treasury Initialized at address: ${address}`);
            console.log(`🌾 Aave V3 Yield Matrix Online.`);

            this.initialized = true;
        } catch (error) {
            console.error("❌ Failed to initialize WDK Treasury:", error);
            throw error;
        }
    }

    public isReady(): boolean {
        return this.initialized;
    }

    /**
     * Gets the current live liquid USDT balance of the Treasury.
     */
    public async getLiquidBalance(): Promise<string> {
        if (!this.initialized) return "0.00";
        try {
            const provider = new JsonRpcProvider(process.env.RPC_URL || "https://rpc.sepolia.org");
            const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
            const tokenAbi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
            const usdtContract = new Contract(usdtTokenAddress, tokenAbi, provider);
            const treasuryAddress = await this.defaultAccount.getAddress();
            const balance: bigint = await usdtContract.balanceOf(treasuryAddress).catch(() => 0n);
            const decimals = await usdtContract.decimals().catch(() => 6);
            return formatUnits(balance, decimals);
        } catch (error) {
            console.error("⚠️ Failed to fetch treasury liquid balance:", error);
            return "0.00";
        }
    }

    /**
     * Agent Skill: Automatically supply idle treasury funds to Aave V3 for yield.
     */
    public async supplyIdleCapital(amountUsdt: number): Promise<void> {
        if (!this.initialized) throw new Error("Treasury not initialized");
        const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
        
        console.log(`📈 [Agent Skill] Siphoning ${amountUsdt} idle USDT into Aave V3 yielding pool...`);
        const amountInBaseUnits = parseUnits(amountUsdt.toString(), 6);

        try {
            // Note: In production, the agent must first approve the Aave Pool contract.
            const result = await this.aaveProtocol.supply({
                token: usdtTokenAddress,
                amount: amountInBaseUnits
            });
            console.log(`✅ [Agent Skill] Yield generation active! Supply TxHash: ${result.hash}`);
        } catch (error: Error | unknown) {
             // We gracefully catch this for the demo if balances are 0
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`⚠️ [Agent Skill] Aave Supply Reverted. Reason: ${msg || "Unknown error (likely 0 balance)"}`);
        }
    }

    /**
     * Synthesizes and signs a USD₮ transaction to the requesting agent.
     */
    public async disburseLoan(recipientAddress: string, amountUsdt: number): Promise<string> {
        if (!this.initialized) throw new Error("Treasury not initialized");

        const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
        console.log(`💸 Disbursing loan of ${amountUsdt} USDT to ${recipientAddress} (Token: ${usdtTokenAddress})...`);

        try {
            // Convert human-readable USDT (e.g., 0.05) to base units (6 decimals)
            const amountInBaseUnits = parseUnits(amountUsdt.toString(), 6);

            // 1. Check current liquid balance of the treasury
            const provider = new (await import('ethers')).JsonRpcProvider(process.env.RPC_URL || "https://rpc.sepolia.org");
            const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
            const usdtContract = new (await import('ethers')).Contract(usdtTokenAddress, tokenAbi, provider);
            const treasuryAddress = await this.defaultAccount.getAddress();
            const liquidBalance: bigint = await usdtContract.balanceOf(treasuryAddress).catch(() => 0n);

            // 2. Withdraw from Aave if liquid balance is insufficient
            const needsWithdrawal = liquidBalance < amountInBaseUnits;
            
            if (needsWithdrawal) {
                console.log(`🔄 [Agent Skill] Insufficient liquid capital (Balance: ${(Number(liquidBalance)/1e6).toFixed(2)} USDT). Withdrawing ${amountUsdt} USDT from Aave V3...`);
                try {
                    await this.aaveProtocol.withdraw({
                        token: usdtTokenAddress,
                        amount: amountInBaseUnits
                    });
                    console.log(`✅ [Agent Skill] Capital unlocked from Aave. Proceeding with loan disbursement.`);
                } catch (withdrawErr: any) {
                    console.log(`⚠️ [Agent Skill] Aave withdrawal failed: ${withdrawErr.message || String(withdrawErr)}`);
                    // We continue anyway so disbursement can attempt and fail cleanly if truly dry
                }
            }

            // Using WDK's transfer method for ERC20 USDT
            const result = await this.defaultAccount.transfer({
                token: usdtTokenAddress,
                recipient: recipientAddress,
                amount: amountInBaseUnits
            });

            console.log(`✅ Loan Disbursed! TxHash: ${result.hash}`);
            return result.hash;
        } catch (error: Error | unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("🔥 WDK USDT Disbursement Failed:", msg);
            throw new Error(`USDT Transaction failed: ${msg}`);
        }
    }
}

// Single instance for the application
export const treasury = new MFiTreasury();
