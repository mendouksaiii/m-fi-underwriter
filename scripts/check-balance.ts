import { JsonRpcProvider, formatEther, Contract, formatUnits } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function checkBalance() {
    const rpcUrl = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const treasuryAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const borrowerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const usdtAddress = process.env.USDT_TOKEN_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";

    const check = async (name: string, addr: string) => {
        console.log(`\n🔎 [${name}] Balance Check`);
        console.log(`   Wallet:  ${addr}`);
        
        try {
            const provider = new JsonRpcProvider(rpcUrl);
            const tokenAbi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function name() view returns (string)"];
            const usdtContract = new Contract(usdtAddress, tokenAbi, provider);

            const [nativeBalance, usdtBalance, decimals, tokenName] = await Promise.all([
                provider.getBalance(addr),
                usdtContract.balanceOf(addr).catch(() => 0n),
                usdtContract.decimals().catch(() => 6),
                usdtContract.name().catch(() => "USDT")
            ]);

            console.log(`   ⛽ ETH:     ${formatEther(nativeBalance)} ETH`);
            console.log(`   💵 ${tokenName.padEnd(8)}: ${formatUnits(usdtBalance, decimals)} USDT`);
            
            if (nativeBalance < 10000000000000000n) { // < 0.01 ETH
                console.log(`   ⚠️ LOW GAS. Need ~0.02 ETH. Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia`);
            }
        } catch (error) {
            console.error(`   ❌ Failed:`, error);
        }
    };

    await check("TREASURY", treasuryAddress);
    await check("BORROWER", borrowerAddress);
}

checkBalance();
