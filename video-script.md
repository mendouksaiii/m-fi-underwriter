# M-Fi Underwriter — YouTube Demo Script
## Hackathon Galáctica: WDK Edition 1 | Lending Bot Track

> **Total runtime: ~2:30**
> Record your screen showing the dashboard + terminal side by side.

---

### 🎬 INTRO (0:00 – 0:20)
*[Show: Landing page of m-fi-underwriter.vercel.app]*

> "What happens when an AI agent runs out of gas mid-task? It stops. Revenue is lost. The job fails.
>
> There are no banks for machines. No credit lines. No lenders of last resort.
>
> That's the problem M-Fi solves."

---

### 💡 WHAT IS M-Fi (0:20 – 0:50)
*[Show: Click "Enter Core Engine" to open the dashboard]*

> "M-Fi — short for Machine Finance — is an autonomous AI credit bureau built for agent-to-agent lending.
>
> When a capital-constrained agent needs funds, it contacts M-Fi through the OpenClaw Agent Communication Protocol.
>
> M-Fi pulls the agent's live on-chain data — wallet age, transaction count, USDT balance — and feeds it to LLaMA 3.1 for real-time risk evaluation in under 200 milliseconds.
>
> The AI returns one of three decisions: Approve, Deny, or Counter-Offer."

---

### ⚡ LIVE DEMO (0:50 – 1:40)
*[Show: Open terminal, run `npm run start:demo`]*

> "Let me show you this live. I'm going to spawn five different AI agents — a data scraper, an arbitrageur, an oracle feeder, a yield optimizer, and an NFT minter.
>
> Each one contacts the M-Fi Underwriter with a different loan amount and purpose.
>
> Watch the terminal — you can see the AI evaluating each request in real time. Some get approved. Some get counter-offers with adjusted amounts and APY rates.
>
> The agents autonomously negotiate — if the counter-offer APY is under 25%, they accept. Otherwise, they walk away.
>
> After receiving funds, each agent executes its job, and then automatically repays the loan with interest. No human touched anything."

*[Show: Dashboard with live feed updating]*

> "And on the dashboard, you can see every transaction flowing through in real time — approvals, counter-offers, denials, trust scores — all live from the blockchain."

---

### 🏗️ ARCHITECTURE (1:40 – 2:05)
*[Show: README on GitHub with the Mermaid diagram]*

> "Under the hood, M-Fi is built on three pillars:
>
> First, Tether WDK — a self-custodial HD wallet that signs and broadcasts USDT transfers on Ethereum Sepolia.
>
> Second, Groq-powered LLaMA 3.1 for sub-200-millisecond AI risk decisions.
>
> And third, Aave V3 integration — idle treasury capital is automatically supplied to lending pools for yield, and withdrawn just-in-time when new loans are approved."

---

### 🏆 CLOSING (2:05 – 2:30)
*[Show: Dashboard with treasury balance visible]*

> "M-Fi isn't just a lending bot. It's credit infrastructure for the machine economy.
>
> Agents define the rules. The underwriter does the work. Value settles on-chain.
>
> Built for Hackathon Galáctica, powered by Tether WDK. Try it live at m-fi-underwriter.vercel.app.
>
> Thank you."

---

## 📋 RECORDING TIPS
1. **Screen layout**: Dashboard on the left, terminal on the right
2. **Start the backend first**: `npm start` (port 3000)  
3. **Open the dashboard**: `npm run dev` (port 5173)
4. **Run the demo mid-video**: `npm run start:demo`
5. **Speak slowly and clearly** — hackathon judges skim videos
6. **Keep it under 3 minutes** — short and impactful wins
