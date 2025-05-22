"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const WalletService_1 = require("./services/WalletService");
const WalletPersonaService_1 = require("./services/WalletPersonaService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// API endpoint to analyze a wallet
app.post('/api/analyze-wallet', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        // Use the API key directly if not found in environment
        const apiKey = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0YzdkNDc5LTE4ODMtNGY1YS05YjRiLTRhOTA3NDQyODQ3YiIsIm9yZ0lkIjoiNDQ4MTY3IiwidXNlcklkIjoiNDYxMTA0IiwidHlwZUlkIjoiNDFkZWZkYjAtMjY0MC00NDM1LTk4NDEtZDY1ZGI2MTVmMTFiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDc3NTM0ODksImV4cCI6NDkwMzUxMzQ4OX0.UHCyuzpPgcRzjN6D-mEunTSpWUU7em-ByyCeiqJa4ic';
        // Use a public Ethereum RPC endpoint
        const rpcUrl = process.env.RPC_URL || 'https://ethereum-rpc.publicnode.com';
        console.log(`Analyzing wallet: ${address}`);
        const walletService = new WalletService_1.WalletService(apiKey, rpcUrl);
        const personaService = new WalletPersonaService_1.WalletPersonaService();
        // Fetch wallet details
        const details = await walletService.getWalletDetails(address);
        // Generate persona
        const persona = personaService.generatePersona(details);
        // Combine and return the data
        res.json({
            success: true,
            address,
            details,
            persona
        });
    }
    catch (error) {
        console.error('Error analyzing wallet:', error);
        res.status(500).json({
            error: 'Failed to analyze wallet',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
