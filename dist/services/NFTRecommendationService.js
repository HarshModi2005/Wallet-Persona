"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTRecommendationService = void 0;
const GeminiAIService_1 = require("./GeminiAIService");
const axios_1 = __importDefault(require("axios"));
class NFTRecommendationService {
    constructor() {
        this.OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
        this.NFTPORT_API_KEY = process.env.NFTPORT_API_KEY;
        this.ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
        this.geminiAI = new GeminiAIService_1.GeminiAIService();
    }
    /**
     * Main recommendation engine - generates personalized NFT suggestions
     */
    async generateNFTRecommendations(walletDetails, preferences) {
        try {
            // Step 1: Analyze user's NFT profile and preferences
            const userProfile = await this.analyzeUserNFTProfile(walletDetails);
            const mergedPreferences = { ...userProfile, ...preferences };
            // Step 2: Get multiple recommendation types
            const [trendingRecs, similarStyleRecs, undervaluedRecs, aiPoweredRecs] = await Promise.all([
                this.getTrendingRecommendations(mergedPreferences),
                this.getSimilarStyleRecommendations(walletDetails.nfts, mergedPreferences),
                this.getUndervaluedRecommendations(mergedPreferences),
                this.getAIPoweredRecommendations(walletDetails, mergedPreferences)
            ]);
            // Step 3: Combine and score recommendations
            const allRecommendations = [
                ...trendingRecs,
                ...similarStyleRecs,
                ...undervaluedRecs,
                ...aiPoweredRecs
            ];
            // Step 4: Remove duplicates and apply final scoring
            const uniqueRecommendations = this.deduplicateAndScore(allRecommendations, mergedPreferences);
            // Step 5: Sort by recommendation score and return top results
            return uniqueRecommendations
                .sort((a, b) => b.recommendationScore - a.recommendationScore)
                .slice(0, 10);
        }
        catch (error) {
            console.error('Error generating NFT recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }
    /**
     * Analyzes user's NFT behavior to create preference profile
     */
    async analyzeUserNFTProfile(walletDetails) {
        const nfts = walletDetails.nfts || [];
        const nftTransactions = this.extractNFTTransactions(walletDetails.transactions || []);
        // Analyze purchase patterns
        const purchasePrices = nftTransactions
            .filter(tx => tx.type === 'incoming')
            .map(tx => parseFloat(tx.value) || 0)
            .filter(price => price > 0);
        const avgPurchasePrice = purchasePrices.length > 0
            ? purchasePrices.reduce((sum, price) => sum + price, 0) / purchasePrices.length
            : 0.1; // Default 0.1 ETH
        // Determine trading frequency
        const totalNFTTransactions = nftTransactions.length;
        const uniqueCollections = new Set(nfts.map(nft => nft.contractAddress)).size;
        const tradingFrequency = this.determineTradingFrequency(totalNFTTransactions, uniqueCollections);
        // Analyze collection categories
        const preferredCategories = await this.analyzeCollectionCategories(nfts);
        // Determine risk tolerance based on purchase behavior
        const riskTolerance = this.determineRiskTolerance(purchasePrices, nfts);
        return {
            preferredCategories,
            avgPurchasePrice,
            riskTolerance,
            tradingFrequency,
            favoriteMarketplaces: ['opensea', 'blur'], // Default, can be enhanced
            preferredArtStyles: await this.analyzeArtStyles(nfts),
            budgetRange: {
                min: Math.max(0.01, avgPurchasePrice * 0.5),
                max: avgPurchasePrice * 2
            },
            timeHorizon: tradingFrequency === 'flipper' ? 'short' : 'long'
        };
    }
    /**
     * Gets trending NFT collections based on market data
     */
    async getTrendingRecommendations(preferences) {
        try {
            const trendingData = await this.fetchTrendingNFTs();
            return trendingData
                .filter(nft => {
                // Filter by budget range
                return nft.floorPrice >= preferences.budgetRange.min &&
                    nft.floorPrice <= preferences.budgetRange.max;
            })
                .map(nft => ({
                contractAddress: nft.contractAddress,
                collectionName: nft.name,
                floorPrice: nft.floorPrice,
                volume24h: nft.volume24h,
                priceChange24h: nft.priceChange24h,
                recommendationScore: this.calculateTrendingScore(nft, preferences),
                recommendationReason: `Trending collection with ${nft.volume24h.toFixed(2)} ETH 24h volume`,
                category: 'trending',
                riskLevel: this.assessRiskLevel(nft),
                holderCount: nft.holders,
                marketCap: nft.marketCap
            }))
                .slice(0, 3);
        }
        catch (error) {
            console.error('Error fetching trending recommendations:', error);
            return [];
        }
    }
    /**
     * Recommends NFTs similar to user's current collection
     */
    async getSimilarStyleRecommendations(userNFTs, preferences) {
        if (userNFTs.length === 0)
            return [];
        try {
            // Get collections similar to user's holdings
            const userCollections = [...new Set(userNFTs.map(nft => nft.contractAddress))];
            const similarCollections = await this.findSimilarCollections(userCollections);
            return similarCollections
                .filter(collection => !userCollections.includes(collection.contractAddress))
                .map(collection => ({
                contractAddress: collection.contractAddress,
                collectionName: collection.name,
                floorPrice: collection.floorPrice,
                volume24h: collection.volume24h || 0,
                priceChange24h: collection.priceChange24h || 0,
                recommendationScore: this.calculateSimilarityScore(collection, preferences),
                recommendationReason: `Similar to your existing collections`,
                category: 'similar_style',
                riskLevel: this.assessRiskLevel(collection),
                imageUrl: collection.imageUrl
            }))
                .slice(0, 3);
        }
        catch (error) {
            console.error('Error getting similar style recommendations:', error);
            return [];
        }
    }
    /**
     * Finds undervalued NFTs based on market analysis
     */
    async getUndervaluedRecommendations(preferences) {
        try {
            const marketData = await this.analyzeMarketForUndervaluedNFTs();
            return marketData
                .filter(nft => nft.floorPrice >= preferences.budgetRange.min &&
                nft.floorPrice <= preferences.budgetRange.max)
                .map(nft => ({
                contractAddress: nft.contractAddress,
                collectionName: nft.name,
                floorPrice: nft.floorPrice,
                volume24h: nft.volume24h,
                priceChange24h: nft.priceChange24h,
                recommendationScore: this.calculateUndervaluedScore(nft, preferences),
                recommendationReason: `Potentially undervalued based on historical data`,
                category: 'undervalued',
                riskLevel: 'medium',
                marketCap: nft.marketCap
            }))
                .slice(0, 2);
        }
        catch (error) {
            console.error('Error getting undervalued recommendations:', error);
            return [];
        }
    }
    /**
     * Uses AI to generate sophisticated recommendations
     */
    async getAIPoweredRecommendations(walletDetails, preferences) {
        try {
            const prompt = this.buildAIRecommendationPrompt(walletDetails, preferences);
            // Use the existing GeminiAIService method structure
            const aiResponse = await this.geminiAI.analyzeTransactions(walletDetails.transactions || [], walletDetails.address, walletDetails.profile || { address: walletDetails.address, totalTransactions: 0, totalNftsHeld: 0, uniqueNftCollectionsCount: 0, topNftCollections: [] }, walletDetails.nfts || [], walletDetails.balance || { native: '0', usdValue: 0, totalTokenUsdValue: 0, grandTotalUsdValue: 0 }, walletDetails.tokens || [], walletDetails.historicalActivity || [], walletDetails.keyEvents || []);
            // Extract NFT recommendations from AI response
            const aiRecommendations = this.extractNFTRecommendationsFromAI(aiResponse);
            // Enrich AI recommendations with market data
            const enrichedRecommendations = await Promise.all(aiRecommendations.map(async (rec) => {
                const marketData = await this.fetchCollectionData(rec.contractAddress);
                return {
                    ...rec,
                    floorPrice: (marketData === null || marketData === void 0 ? void 0 : marketData.floorPrice) || rec.floorPrice,
                    volume24h: (marketData === null || marketData === void 0 ? void 0 : marketData.volume24h) || 0,
                    priceChange24h: (marketData === null || marketData === void 0 ? void 0 : marketData.priceChange24h) || 0,
                    recommendationScore: 85, // High score for AI recommendations
                    category: 'emerging',
                    riskLevel: 'medium',
                    aiInsight: rec.aiInsight
                };
            }));
            return enrichedRecommendations.slice(0, 2);
        }
        catch (error) {
            console.error('Error getting AI-powered recommendations:', error);
            return [];
        }
    }
    /**
     * Builds AI prompt for personalized recommendations
     */
    buildAIRecommendationPrompt(walletDetails, preferences) {
        var _a;
        const userCollections = ((_a = walletDetails.nfts) === null || _a === void 0 ? void 0 : _a.map(nft => nft.collectionName).join(', ')) || 'None';
        const userCategories = preferences.preferredCategories.join(', ');
        return `
    As an NFT market expert, analyze this user's profile and recommend 2-3 NFT collections:

    USER PROFILE:
    - Current NFT Collections: ${userCollections}
    - Preferred Categories: ${userCategories}
    - Average Purchase Price: ${preferences.avgPurchasePrice} ETH
    - Risk Tolerance: ${preferences.riskTolerance}
    - Trading Style: ${preferences.tradingFrequency}
    - Budget Range: ${preferences.budgetRange.min}-${preferences.budgetRange.max} ETH
    - Time Horizon: ${preferences.timeHorizon}-term

    REQUIREMENTS:
    1. Recommend collections within budget range
    2. Match user's risk tolerance and style preferences
    3. Consider current market trends and fundamentals
    4. Avoid collections they already own
    5. Provide specific reasoning for each recommendation

    FORMAT RESPONSE AS JSON:
    [
      {
        "contractAddress": "0x...",
        "collectionName": "Collection Name",
        "recommendationReason": "Detailed reason for recommendation",
        "aiInsight": "Advanced market insight or prediction",
        "floorPrice": 0.5
      }
    ]
    `;
    }
    /**
     * Market data fetching methods
     */
    async fetchTrendingNFTs() {
        var _a;
        // Implementation would use multiple APIs like OpenSea, NFTPort, Alchemy
        try {
            const response = await axios_1.default.get('https://api.opensea.io/api/v1/collections', {
                headers: { 'X-API-KEY': this.OPENSEA_API_KEY },
                params: {
                    offset: 0,
                    limit: 50,
                    sortBy: 'seven_day_volume'
                }
            });
            return ((_a = response.data.collections) === null || _a === void 0 ? void 0 : _a.map((collection) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return ({
                    contractAddress: ((_b = (_a = collection.primary_asset_contracts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.address) || '',
                    name: collection.name,
                    floorPrice: ((_c = collection.stats) === null || _c === void 0 ? void 0 : _c.floor_price) || 0,
                    volume24h: ((_d = collection.stats) === null || _d === void 0 ? void 0 : _d.one_day_volume) || 0,
                    sales24h: ((_e = collection.stats) === null || _e === void 0 ? void 0 : _e.one_day_sales) || 0,
                    priceChange24h: ((_f = collection.stats) === null || _f === void 0 ? void 0 : _f.one_day_change) || 0,
                    holders: ((_g = collection.stats) === null || _g === void 0 ? void 0 : _g.num_owners) || 0,
                    totalSupply: ((_h = collection.stats) === null || _h === void 0 ? void 0 : _h.total_supply) || 0,
                    marketCap: (((_j = collection.stats) === null || _j === void 0 ? void 0 : _j.floor_price) || 0) * (((_k = collection.stats) === null || _k === void 0 ? void 0 : _k.total_supply) || 0),
                    category: this.categorizeCollection(collection),
                    isVerified: collection.safelist_request_status === 'verified'
                });
            })) || [];
        }
        catch (error) {
            console.error('Error fetching trending NFTs:', error);
            return [];
        }
    }
    /**
     * Scoring and analysis methods
     */
    calculateTrendingScore(nft, preferences) {
        let score = 50; // Base score
        // Volume score (0-25 points)
        const volumeScore = Math.min(25, (nft.volume24h / 100) * 25);
        score += volumeScore;
        // Price change score (0-15 points)
        if (nft.priceChange24h > 0) {
            score += Math.min(15, nft.priceChange24h * 5);
        }
        // Holder count score (0-10 points)
        const holderScore = Math.min(10, (nft.holders / 1000) * 10);
        score += holderScore;
        // Budget alignment (-20 to +10 points)
        if (nft.floorPrice >= preferences.budgetRange.min && nft.floorPrice <= preferences.budgetRange.max) {
            score += 10;
        }
        else {
            score -= 20;
        }
        return Math.max(0, Math.min(100, score));
    }
    assessRiskLevel(nft) {
        const volume = nft.volume24h || 0;
        const priceChange = Math.abs(nft.priceChange24h || 0);
        if (volume > 50 && priceChange < 5)
            return 'low';
        if (volume > 10 && priceChange < 20)
            return 'medium';
        return 'high';
    }
    /**
     * Helper methods
     */
    extractNFTTransactions(transactions) {
        return transactions.filter(tx => {
            var _a, _b;
            return (_b = (_a = tx.raw) === null || _a === void 0 ? void 0 : _a.logs) === null || _b === void 0 ? void 0 : _b.some((log) => { var _a; return ((_a = log.topics) === null || _a === void 0 ? void 0 : _a[0]) === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; });
        });
    }
    determineTradingFrequency(totalTransactions, uniqueCollections) {
        const ratio = totalTransactions / Math.max(1, uniqueCollections);
        if (ratio > 3)
            return 'flipper';
        if (ratio < 1.5)
            return 'holder';
        return 'mixed';
    }
    determineRiskTolerance(purchasePrices, nfts) {
        const avgPrice = purchasePrices.reduce((sum, price) => sum + price, 0) / purchasePrices.length;
        const priceVariance = this.calculateVariance(purchasePrices);
        if (avgPrice < 0.5 && priceVariance < 0.1)
            return 'conservative';
        if (avgPrice > 2 || priceVariance > 1)
            return 'aggressive';
        return 'moderate';
    }
    calculateVariance(prices) {
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    }
    async analyzeCollectionCategories(nfts) {
        // Simplified implementation - in production, use AI or collection metadata
        const categories = new Set();
        nfts.forEach(nft => {
            var _a;
            const name = ((_a = nft.collectionName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (name.includes('punk') || name.includes('ape'))
                categories.add('pfp');
            if (name.includes('art') || name.includes('generative'))
                categories.add('art');
            if (name.includes('game') || name.includes('meta'))
                categories.add('gaming');
            if (name.includes('land') || name.includes('world'))
                categories.add('metaverse');
        });
        return Array.from(categories);
    }
    async analyzeArtStyles(nfts) {
        // Simplified implementation - in production, use image analysis AI
        return ['digital', 'abstract', 'realistic']; // Placeholder
    }
    categorizeCollection(collection) {
        var _a;
        const name = ((_a = collection.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        if (name.includes('punk') || name.includes('ape') || name.includes('avatar'))
            return 'pfp';
        if (name.includes('art') || name.includes('canvas'))
            return 'art';
        if (name.includes('game') || name.includes('card'))
            return 'gaming';
        if (name.includes('land') || name.includes('plot'))
            return 'metaverse';
        return 'utility';
    }
    deduplicateAndScore(recommendations, preferences) {
        const uniqueRecs = new Map();
        recommendations.forEach(rec => {
            const existing = uniqueRecs.get(rec.contractAddress);
            if (!existing || rec.recommendationScore > existing.recommendationScore) {
                uniqueRecs.set(rec.contractAddress, rec);
            }
        });
        return Array.from(uniqueRecs.values());
    }
    /**
     * Fallback recommendations for error cases
     */
    getFallbackRecommendations() {
        return [
            {
                contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
                collectionName: 'Bored Ape Yacht Club',
                floorPrice: 10.5,
                volume24h: 150.2,
                priceChange24h: 2.3,
                recommendationScore: 85,
                recommendationReason: 'Blue chip NFT collection with strong community',
                category: 'blue_chip',
                riskLevel: 'low'
            }
        ];
    }
    // Placeholder methods for external API calls
    async findSimilarCollections(userCollections) {
        // Implementation would use similarity algorithms or external APIs
        return [];
    }
    async analyzeMarketForUndervaluedNFTs() {
        // Implementation would analyze price history, fundamentals, etc.
        return [];
    }
    async fetchCollectionData(contractAddress) {
        // Implementation would fetch real-time collection data
        return null;
    }
    parseAIRecommendations(aiResponse) {
        try {
            return JSON.parse(aiResponse);
        }
        catch (error) {
            console.error('Error parsing AI recommendations:', error);
            return [];
        }
    }
    calculateSimilarityScore(collection, preferences) {
        let score = 60; // Base score for similar collections
        // Category match bonus
        if (preferences.preferredCategories.includes(collection.category)) {
            score += 20;
        }
        // Budget alignment
        if (collection.floorPrice >= preferences.budgetRange.min &&
            collection.floorPrice <= preferences.budgetRange.max) {
            score += 15;
        }
        else {
            score -= 10;
        }
        // Volume bonus
        const volumeBonus = Math.min(10, (collection.volume24h / 50) * 10);
        score += volumeBonus;
        return Math.max(0, Math.min(100, score));
    }
    calculateUndervaluedScore(nft, preferences) {
        let score = 55; // Base score for undervalued
        // Low price change penalty (might indicate lack of interest)
        if (Math.abs(nft.priceChange24h) < 2) {
            score -= 5;
        }
        // Holder count consideration
        if (nft.holders > 500 && nft.holders < 5000) {
            score += 15; // Sweet spot for undervalued collections
        }
        // Budget alignment
        if (nft.floorPrice >= preferences.budgetRange.min &&
            nft.floorPrice <= preferences.budgetRange.max) {
            score += 10;
        }
        // Market cap to volume ratio
        const mcToVolumeRatio = nft.marketCap / Math.max(1, nft.volume24h);
        if (mcToVolumeRatio > 10 && mcToVolumeRatio < 100) {
            score += 15; // Potentially undervalued
        }
        return Math.max(0, Math.min(100, score));
    }
    extractNFTRecommendationsFromAI(aiResponse) {
        // Extract NFT recommendations from the AI analysis response
        // This would parse the AI response for NFT-related recommendations
        try {
            // Placeholder implementation - would extract from aiResponse.recommendations or custom NFT analysis
            return [
                {
                    contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
                    collectionName: 'Doodles',
                    recommendationReason: 'Strong community and growing utility',
                    aiInsight: 'Collection shows consistent growth pattern similar to your existing holdings',
                    floorPrice: 2.5
                }
            ];
        }
        catch (error) {
            console.error('Error extracting NFT recommendations from AI:', error);
            return [];
        }
    }
}
exports.NFTRecommendationService = NFTRecommendationService;
