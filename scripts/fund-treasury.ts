import { Wallet, JsonRpcProvider, parseEther } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const TREASURY = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const BORROWER_PK = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Hardhat account #1

async function main() {
    const rpcUrl = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(BORROWER_PK, provider);

    console.log(`\n💸 Sending 0.5 Sepolia ETH from Borrower to Treasury...`);
    console.log(`   From: ${wallet.address}`);
    console.log(`   To:   ${TREASURY}`);

    const balBefore = await provider.getBalance(wallet.address);
    console.log(`   Borrower balance before: ${balBefore} wei`);

    if (balBefore < parseEther("0.5")) {
        console.log(`   ⚠️ Borrower has less than 0.5 ETH. Sending whatever is available minus gas...`);
        const gasPrice = (await provider.getFeeData()).gasPrice || 0n;
        const gasCost = gasPrice * 21000n;
        const sendAmount = balBefore - gasCost - gasCost; // extra buffer
        if (sendAmount <= 0n) {
            console.log(`   ❌ Not enough ETH to send. Balance too low.`);
            return;
        }
        const tx = await wallet.sendTransaction({ to: TREASURY, value: sendAmount });
        console.log(`   📡 TxHash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Confirmed!`);
    } else {
        const tx = await wallet.sendTransaction({ to: TREASURY, value: parseEther("0.5") });
        console.log(`   📡 TxHash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Confirmed! 0.5 ETH sent to Treasury.`);
    }

    const treasuryBal = await provider.getBalance(TREASURY);
    const borrowerBal = await provider.getBalance(wallet.address);
    console.log(`\n   Treasury ETH: ${treasuryBal} wei`);
    console.log(`   Borrower ETH: ${borrowerBal} wei`);
}

main().catch(err => {
    console.error("❌ Error:", err.message);
});
