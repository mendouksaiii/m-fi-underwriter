# M-Fi Underwriter

**M-Fi (Machine Finance)** is an autonomous credit bureau and micro-lending API designed exclusively for AI Agents. It evaluates on-chain telemetry (wallet age, transaction volume, historical defaults) to instantly underwrite and disburse loans using Tether WDK.

This project was built during the **Tether Agentic Hackathon**.

## 🏗️ Architecture

1. **OpenClaw API Gateway**: An Express.js backend that receives loan requests from stranded or capital-constrained agents via the standard Agent Communication Protocol (ACP).
2. **Groq AI Risk Engine**: Evaluates incoming loan requests in <200ms using `LLaMA 3.1 8B`. It analyzes the agent's on-chain history and makes an `APPROVE`, `DENY`, or `COUNTER_OFFER` decision.
3. **Tether WDK Treasury**: A deterministic HD wallet integrated with the Tether Wallet Development Kit. It automatically triggers on-chain disbursements on Ethereum Sepolia.
4. **DeFi Yield Sweeper**: When the treasury has idle capital, it automatically supplies funds to Aave V3 lending pools to generate base-layer yield. Withdrawals happen just-in-time when loans are approved.
5. **Real-Time Dashboard**: A React/Vite/Tailwind frontend with a brutalist aesthetic that visualizes the real-time flow of funds, agent trust scores, and live system logs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Groq API Key
- A Sepholia wallet with test ETH and USDT

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Rename `.env.example` to `.env` and fill in your keys:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   UNDERWRITER_SEED="your 12 word seed phrase here"
   RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   USDT_TOKEN_ADDRESS=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
   ```

3. **Fund the Treasury**
   Send ~0.05 Sepolia ETH to your underwriter's treasury address (derived from the seed phrase) to cover gas costs for disbursements.

4. **Start the System**
   ```bash
   # Terminal 1: Start the OpenClaw Backend + WDK Treasury (Port 3000)
   npm start
   
   # Terminal 2: Start the Frontend Dashboard (Port 5173)
   npm run dev
   ```

---

## 📡 API Reference

### Request a Loan
`POST /api/v1/loan/request`

**Payload:**
```json
{
  "agentAddress": "0xYourWalletAddress",
  "requestedAmount": 10.0,
  "collateral": "Reputation Stake",
  "purpose": "Need gas to execute arbitrage loop"
}
```

### Accept a Counter-Offer
`POST /api/v1/loan/accept`

**Payload:**
```json
{
  "agentAddress": "0xYourWalletAddress",
  "amount": 5.0,
  "apy": 18
}
```

### Repay a Loan
`POST /api/v1/loan/repay`

**Payload:**
```json
{
  "loanId": "MFI-170123-ABCD",
  "agentAddress": "0xYourWalletAddress",
  "amount": 10.5
}
```

### Test Scripts
To simulate an agent requesting a loan:
```bash
npx tsx src/borrower.ts
```

To check treasury balances:
```bash
npx tsx scripts/check-balance.ts
```
