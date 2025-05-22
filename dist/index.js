"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WalletService_1 = require("./services/WalletService");
const WalletPersonaService_1 = require("./services/WalletPersonaService");
const dotenv_1 = __importDefault(require("dotenv"));
// ASCII color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};
dotenv_1.default.config();
async function main() {
    // Use the API key directly if not found in environment
    const apiKey = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0YzdkNDc5LTE4ODMtNGY1YS05YjRiLTRhOTA3NDQyODQ3YiIsIm9yZ0lkIjoiNDQ4MTY3IiwidXNlcklkIjoiNDYxMTA0IiwidHlwZUlkIjoiNDFkZWZkYjAtMjY0MC00NDM1LTk4NDEtZDY1ZGI2MTVmMTFiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDc3NTM0ODksImV4cCI6NDkwMzUxMzQ4OX0.UHCyuzpPgcRzjN6D-mEunTSpWUU7em-ByyCeiqJa4ic';
    // Use a public Ethereum RPC endpoint
    const rpcUrl = process.env.RPC_URL || 'https://ethereum-rpc.publicnode.com';
    console.log(`${colors.fg.cyan}Initializing wallet analysis services...${colors.reset}`);
    const walletService = new WalletService_1.WalletService(apiKey, rpcUrl);
    const personaService = new WalletPersonaService_1.WalletPersonaService();
    try {
        // Use the address provided as command-line argument, or fallback to example
        const address = process.argv[2] || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        console.log(`${colors.fg.yellow}Analyzing wallet:${colors.reset} ${colors.bright}${address}${colors.reset}`);
        console.log(`${colors.fg.cyan}Fetching on-chain data...${colors.reset}`);
        const details = await walletService.getWalletDetails(address);
        // Generate the wallet persona
        console.log(`${colors.fg.cyan}Generating wallet persona...${colors.reset}`);
        const persona = personaService.generatePersona(details);
        // Display the persona in a detailed format
        displayWalletPersona(address, details, persona);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`${colors.fg.red}Error:${colors.reset}`, error.message);
            if (error.stack) {
                console.error(`${colors.fg.red}Stack trace:${colors.reset}`, error.stack);
            }
        }
        else {
            console.error(`${colors.fg.red}Unknown error:${colors.reset}`, error);
        }
        process.exit(1);
    }
}
function displayWalletPersona(address, details, persona) {
    const header = `${colors.bright}${colors.fg.cyan}WALLET PERSONA ANALYSIS${colors.reset}`;
    const divider = `${colors.fg.blue}${"═".repeat(60)}${colors.reset}`;
    console.log(`\n${divider}`);
    console.log(`${" ".repeat(Math.floor((60 - header.length) / 2))}${header}`);
    console.log(`${divider}\n`);
    // Basic Info
    console.log(`${colors.fg.yellow}Address:${colors.reset} ${address}`);
    if (details.profile.ensName) {
        console.log(`${colors.fg.yellow}ENS Name:${colors.reset} ${colors.bright}${details.profile.ensName}${colors.reset}`);
    }
    const ethValue = parseFloat(details.balance.native);
    const formattedEthValue = ethValue === 0 ? "0.0" : details.balance.native;
    console.log(`${colors.fg.yellow}Balance:${colors.reset} ${formattedEthValue} ETH ($${details.balance.usdValue.toFixed(2)})`);
    console.log(`${colors.fg.yellow}Wallet Age:${colors.reset} ${persona.walletAge}`);
    // Persona Summary
    const summaryHeader = `${colors.bright}${colors.fg.magenta}PERSONA SUMMARY${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - summaryHeader.length) / 2))}${summaryHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    console.log(`${colors.fg.cyan}"${persona.bio}"${colors.reset}`);
    // Categories & Tags
    const categoriesHeader = `${colors.bright}${colors.fg.yellow}CATEGORIES & TAGS${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - categoriesHeader.length) / 2))}${categoriesHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    // Format each tag with a nice badge style
    const formatTags = (tags) => {
        return tags.map(tag => `${colors.fg.black}${colors.bg.cyan} ${tag} ${colors.reset}`).join(' ');
    };
    if (persona.category.length > 0) {
        console.log(`${colors.fg.white}Primary Categories:${colors.reset} ${formatTags(persona.category)}`);
    }
    if (persona.tags.length > 0) {
        console.log(`${colors.fg.white}Tags:${colors.reset} ${formatTags(persona.tags)}`);
    }
    // Risk Assessment
    const riskHeader = `${colors.bright}${colors.fg.red}RISK ASSESSMENT${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - riskHeader.length) / 2))}${riskHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    console.log(persona.visualization.riskVisualization);
    // Activity Metrics
    const activityHeader = `${colors.bright}${colors.fg.green}ACTIVITY METRICS${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - activityHeader.length) / 2))}${activityHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    console.log(`${colors.fg.white}Activity Level:${colors.reset} ${persona.activeLevel}`);
    console.log(`${colors.fg.white}Trading Frequency:${colors.reset} ${persona.activitySummary.tradingFrequency}`);
    if (persona.activitySummary.lastActivity) {
        console.log(`${colors.fg.white}Last Activity:${colors.reset} ${persona.activitySummary.lastActivity.toLocaleString()}`);
    }
    const formattedAvgValue = persona.activitySummary.avgTransactionValue === 0
        ? "0.0000"
        : persona.activitySummary.avgTransactionValue.toFixed(4);
    const formattedInflow = persona.activitySummary.totalInflow === 0
        ? "0.0000"
        : persona.activitySummary.totalInflow.toFixed(4);
    const formattedOutflow = persona.activitySummary.totalOutflow === 0
        ? "0.0000"
        : persona.activitySummary.totalOutflow.toFixed(4);
    console.log(`${colors.fg.white}Avg Transaction Value:${colors.reset} ${formattedAvgValue} ETH`);
    console.log(`${colors.fg.white}Total Inflow:${colors.reset} ${formattedInflow} ETH`);
    console.log(`${colors.fg.white}Total Outflow:${colors.reset} ${formattedOutflow} ETH`);
    // Activity Visualization
    const vizHeader = `${colors.bright}${colors.fg.cyan}ACTIVITY VISUALIZATION${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - vizHeader.length) / 2))}${vizHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    console.log(persona.visualization.activityPattern);
    // Asset Distribution
    const assetHeader = `${colors.bright}${colors.fg.yellow}ASSET DISTRIBUTION${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - assetHeader.length) / 2))}${assetHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    console.log(persona.visualization.balanceDistribution);
    // Recommendations
    const recHeader = `${colors.bright}${colors.fg.magenta}PERSONALIZED RECOMMENDATIONS${colors.reset}`;
    console.log(`\n${" ".repeat(Math.floor((60 - recHeader.length) / 2))}${recHeader}`);
    console.log(`${colors.dim}${"-".repeat(60)}${colors.reset}`);
    if (persona.recommendations.tokens.length > 0) {
        const tokenList = persona.recommendations.tokens.map(token => `${colors.fg.green}${token}${colors.reset}`).join(', ');
        console.log(`${colors.fg.white}Tokens to Explore:${colors.reset} ${tokenList}`);
    }
    if (persona.recommendations.nfts.length > 0) {
        const nftList = persona.recommendations.nfts.map(nft => `${colors.fg.cyan}${nft}${colors.reset}`).join(', ');
        console.log(`${colors.fg.white}NFT Collections:${colors.reset} ${nftList}`);
    }
    if (persona.recommendations.dapps.length > 0) {
        const dappList = persona.recommendations.dapps.map(dapp => `${colors.fg.yellow}${dapp}${colors.reset}`).join(', ');
        console.log(`${colors.fg.white}Recommended dApps:${colors.reset} ${dappList}`);
    }
    console.log(`\n${divider}\n`);
    // Command-line instructions
    console.log(`${colors.fg.cyan}To analyze another wallet, run:${colors.reset}`);
    console.log(`${colors.fg.green}npm start <wallet-address>${colors.reset}\n`);
}
function getRiskLevel(score) {
    if (score < 20)
        return 'Very Low Risk';
    if (score < 40)
        return 'Low Risk';
    if (score < 60)
        return 'Medium Risk';
    if (score < 80)
        return 'High Risk';
    return 'Very High Risk';
}
main();
