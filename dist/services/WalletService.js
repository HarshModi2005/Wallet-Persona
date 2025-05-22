"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const moralis_1 = __importDefault(require("moralis"));
const ethers_1 = require("ethers");
class WalletService {
    constructor(apiKey, rpcUrl) {
        // Initialize Moralis
        moralis_1.default.start({
            apiKey
        });
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    }
    async getWalletDetails(address) {
        try {
            const [balance, tokens, nfts, transactions, profile, defiPositions] = await Promise.all([
                this.getNativeBalance(address),
                this.getTokenBalances(address),
                this.getNFTs(address),
                this.getTransactions(address),
                this.getWalletProfile(address),
                this.getDeFiPositions(address)
            ]);
            return {
                address,
                balance,
                tokens,
                nfts,
                transactions,
                profile,
                defiPositions
            };
        }
        catch (error) {
            console.error('Error fetching wallet details:', error);
            throw error;
        }
    }
    async getNativeBalance(address) {
        const balance = await this.provider.getBalance(address);
        const ethPrice = await this.getEthPrice();
        return {
            native: ethers_1.ethers.formatEther(balance),
            usdValue: parseFloat(ethers_1.ethers.formatEther(balance)) * ethPrice
        };
    }
    async getTokenBalances(address) {
        try {
            const response = await moralis_1.default.EvmApi.token.getWalletTokenBalances({
                address,
                chain: '0x1'
            });
            const result = response.result || [];
            return result.map((token) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    contractAddress: ((_a = token.token) === null || _a === void 0 ? void 0 : _a.address) || '',
                    symbol: ((_b = token.token) === null || _b === void 0 ? void 0 : _b.symbol) || '',
                    name: ((_c = token.token) === null || _c === void 0 ? void 0 : _c.name) || '',
                    balance: ((_d = token.amount) === null || _d === void 0 ? void 0 : _d.toString()) || '0',
                    usdValue: parseFloat(((_e = token.amount) === null || _e === void 0 ? void 0 : _e.toString()) || '0') * (((_f = token.token) === null || _f === void 0 ? void 0 : _f.usdPrice) || 0)
                });
            });
        }
        catch (error) {
            console.error('Error fetching token balances:', error);
            return [];
        }
    }
    async getNFTs(address) {
        try {
            const response = await moralis_1.default.EvmApi.nft.getWalletNFTs({
                address,
                chain: '0x1'
            });
            const result = response.result || [];
            return result.map((nft) => {
                var _a, _b, _c;
                return ({
                    tokenId: ((_a = nft.tokenId) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                    contractAddress: ((_b = nft.tokenAddress) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                    name: nft.name || '',
                    symbol: nft.symbol || '',
                    imageUrl: nft.metadata && typeof nft.metadata === 'string'
                        ? (_c = JSON.parse(nft.metadata)) === null || _c === void 0 ? void 0 : _c.image
                        : undefined
                });
            });
        }
        catch (error) {
            console.error('Error fetching NFTs:', error);
            return [];
        }
    }
    async getTransactions(address) {
        try {
            const response = await moralis_1.default.EvmApi.transaction.getWalletTransactions({
                address,
                chain: '0x1'
            });
            const result = response.result || [];
            return result.map((tx) => {
                var _a, _b, _c, _d;
                return ({
                    hash: tx.hash || '',
                    from: ((_a = tx.from) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                    to: ((_b = tx.to) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                    value: ((_c = tx.value) === null || _c === void 0 ? void 0 : _c.toString()) || '0',
                    timestamp: tx.blockTimestamp ? new Date(tx.blockTimestamp).getTime() / 1000 : 0,
                    type: ((_d = tx.from) === null || _d === void 0 ? void 0 : _d.toString().toLowerCase()) === address.toLowerCase() ? 'outgoing' : 'incoming'
                });
            });
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }
    async getWalletProfile(address) {
        const [ensName, transactions] = await Promise.all([
            this.provider.lookupAddress(address),
            this.getTransactions(address)
        ]);
        const firstTx = transactions[transactions.length - 1];
        const totalReceived = transactions
            .filter(tx => tx.type === 'incoming')
            .reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        const totalSent = transactions
            .filter(tx => tx.type === 'outgoing')
            .reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        return {
            address,
            ensName: ensName || undefined,
            firstTransactionDate: firstTx ? new Date(firstTx.timestamp * 1000) : undefined,
            totalTransactions: transactions.length,
            totalValueReceived: totalReceived,
            totalValueSent: totalSent
        };
    }
    async getDeFiPositions(address) {
        // This is a placeholder - actual implementation would require
        // integration with specific DeFi protocols or aggregators
        return [];
    }
    async getEthPrice() {
        var _a;
        try {
            const response = await moralis_1.default.EvmApi.token.getTokenPrice({
                address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH contract
                chain: '0x1'
            });
            return ((_a = response.result) === null || _a === void 0 ? void 0 : _a.usdPrice) || 2000;
        }
        catch (error) {
            console.error('Error fetching ETH price:', error);
            return 2000; // Fallback price
        }
    }
}
exports.WalletService = WalletService;
