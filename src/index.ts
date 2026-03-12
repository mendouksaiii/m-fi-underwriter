import * as dotenv from "dotenv";
import { treasury } from "./wallet/wdk-service";
import { OpenClawServer } from "./api/openclaw-server";

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function bootstrap() {
    console.log("███ M-FI UNDERWRITER NODE STARTING ███");

    // 1. Initialize the WDK Treasury
    console.log("[1/2] Booting WDK Treasury...");
    await treasury.initialize();

    // 2. Start the OpenClaw API
    console.log("[2/2] Booting OpenClaw API Server...");
    const server = new OpenClawServer(treasury);
    server.start(PORT);

    console.log("\n⚡ [M-Fi Underwriter] Online and ready for agent loan requests.");

    // Keep the process alive explicitly in background environments
    process.stdin.resume();
}

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
bootstrap().catch((error) => {
    console.error("🔥 Fatal error during bootstrap:", error);
    process.exit(1);
});
