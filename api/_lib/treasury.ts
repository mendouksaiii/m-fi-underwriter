import WDK from "@tetherto/wdk";
import WalletManagerEvm, { WalletAccountEvm } from "@tetherto/wdk-wallet-evm";
import AaveProtocolEvm from "@tetherto/wdk-protocol-lending-aave-evm";
import { parseUnits, JsonRpcProvider, Contract, formatUnits } from "ethers";

let _treasury: MFiTreasury | null = null;

export class MFiTreasury {
    private wdk: WDK;
    private defaultAccount!: WalletAccountEvm;
    private aaveProtocol!: AaveProtocolEvm;
    private initialized = false;

    constructor() {
        const seed = process.env.UNDERWRITER_SEED || "test test test test test test test test test test test junk";
        this.wdk = new WDK(seed);
    }

    public async initialize(): Promise<void> {
        if (this.initialized) return;
        const evmConfig = { provider: process.env.RPC_URL || "https://testnet.hsk.xyz" };
        this.wdk.registerWallet('hashkey-testnet', WalletManagerEvm, evmConfig);
        this.defaultAccount = await this.wdk.getAccount('hashkey-testnet', 0) as unknown as WalletAccountEvm;
        this.aaveProtocol = new AaveProtocolEvm(this.defaultAccount);
        this.initialized = true;
    }

    public isReady(): boolean { return this.initialized; }

    public async getLiquidBalance(): Promise<string> {
        if (!this.initialized) return "0.00";
        try {
            const provider = new JsonRpcProvider(process.env.RPC_URL || "https://testnet.hsk.xyz");
            const usdtAddress = process.env.USDT_TOKEN_ADDRESS || "0xB210D2120d57b758EE163cFfb43e73728c471Cf1";
            const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
            const contract = new Contract(usdtAddress, abi, provider);
            const address = await this.defaultAccount.getAddress();
            const balance: bigint = await contract.balanceOf(address).catch(() => 0n);
            const decimals = await contract.decimals().catch(() => 6);
            return formatUnits(balance, decimals);
        } catch { return "0.00"; }
    }

    public async supplyIdleCapital(amountUsdt: number): Promise<string> {
        if (!this.initialized) throw new Error("Treasury not initialized");
        const usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS || "0xB210D2120d57b758EE163cFfb43e73728c471Cf1";
        const amountInBaseUnits = parseUnits(amountUsdt.toString(), 6);

        try {
            const result = await this.aaveProtocol.supply({
                token: usdtTokenAddress,
                amount: amountInBaseUnits
            });
            return result.hash;
        } catch (error: Error | unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Aave Supply Reverted: ${msg}`);
        }
    }

    public async disburseLoan(recipientAddress: string, amountUsdt: number): Promise<string> {
        if (!this.initialized) throw new Error("Treasury not initialized");
        const usdtAddress = process.env.USDT_TOKEN_ADDRESS || "0xB210D2120d57b758EE163cFfb43e73728c471Cf1";
        const amountInBaseUnits = parseUnits(amountUsdt.toString(), 6);

        const provider = new JsonRpcProvider(process.env.RPC_URL || "https://testnet.hsk.xyz");
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const contract = new Contract(usdtAddress, abi, provider);
        const treasuryAddress = await this.defaultAccount.getAddress();
        const liquidBalance: bigint = await contract.balanceOf(treasuryAddress).catch(() => 0n);

        if (liquidBalance < amountInBaseUnits) {
            try {
                await this.aaveProtocol.withdraw({ token: usdtAddress, amount: amountInBaseUnits });
            } catch {}
        }

        const result = await this.defaultAccount.transfer({
            token: usdtAddress,
            recipient: recipientAddress,
            amount: amountInBaseUnits
        });
        return result.hash;
    }
}

export async function getTreasury(): Promise<MFiTreasury> {
    if (!_treasury) {
        _treasury = new MFiTreasury();
        await _treasury.initialize();
    }
    return _treasury;
}
