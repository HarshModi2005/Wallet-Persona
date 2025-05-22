"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletPersonaService = void 0;
class WalletPersonaService {
    /**
     * Generate a complete wallet persona based on wallet details
     */
    generatePersona(walletDetails) {
        const category = this.determineCategory(walletDetails);
        const riskScore = this.calculateRiskScore(walletDetails);
        const activeLevel = this.determineActivityLevel(walletDetails.transactions);
        const preferredTokens = this.getPreferredTokens(walletDetails.tokens);
        const walletAge = this.determineWalletAge(walletDetails);
        const topCollections = this.getTopCollections(walletDetails.nfts);
        const activitySummary = this.generateActivitySummary(walletDetails);
        const tags = this.generateTags(walletDetails, category, activeLevel);
        const recommendations = this.generateRecommendations(walletDetails, category);
        const visualization = this.generateVisualizations(walletDetails, riskScore);
        return {
            category,
            activeLevel,
            riskScore,
            preferredTokens,
            walletAge,
            topCollections,
            bio: this.generateBio(walletDetails, category, activeLevel, preferredTokens, topCollections),
            tags,
            recommendations,
            activitySummary,
            visualization
        };
    }
    /**
     * Determine wallet categories based on activity patterns
     */
    determineCategory(walletDetails) {
        const categories = [];
        // NFT Collector check
        if (walletDetails.nfts.length > 5) {
            categories.push('NFT Collector');
        }
        // DeFi Investor check
        const defiTokens = ['AAVE', 'COMP', 'MKR', 'UNI', 'SUSHI', 'YFI', 'CRV', 'BAL'];
        const hasDefiTokens = walletDetails.tokens.some(token => defiTokens.includes(token.symbol.toUpperCase()));
        if (hasDefiTokens || walletDetails.defiPositions.length > 0) {
            categories.push('DeFi Investor');
        }
        // Trader check - high transaction count
        if (walletDetails.transactions.length > 50) {
            categories.push('Active Trader');
        }
        // DAO Member check - governance tokens
        const governanceTokens = ['UNI', 'COMP', 'MKR', 'AAVE', 'ENS', 'DYDX', 'OP', 'ARB'];
        const hasGovernanceTokens = walletDetails.tokens.some(token => governanceTokens.includes(token.symbol.toUpperCase()));
        if (hasGovernanceTokens) {
            categories.push('DAO Member');
        }
        // Whale check - large ETH balance
        if (parseFloat(walletDetails.balance.native) > 100) {
            categories.push('Whale');
        }
        // Meme Token Enthusiast
        const memeTokens = ['SHIB', 'DOGE', 'PEPE', 'FLOKI', 'ELON'];
        const hasMemeTokens = walletDetails.tokens.some(token => memeTokens.includes(token.symbol.toUpperCase()));
        if (hasMemeTokens) {
            categories.push('Meme Token Enthusiast');
        }
        // If no categories found
        if (categories.length === 0) {
            categories.push('Casual User');
        }
        return categories;
    }
    /**
     * Calculate a risk score based on activity patterns
     * 0-100 where lower is safer
     */
    calculateRiskScore(walletDetails) {
        // For empty wallets with no transactions, give a low risk score
        if (walletDetails.transactions.length === 0 && parseFloat(walletDetails.balance.native) === 0) {
            return 15; // Empty wallets are low risk
        }
        let score = 50; // Start at medium risk
        // Lower risk if wallet has a lot of history
        if (walletDetails.transactions.length > 100) {
            score -= 10;
        }
        // Lower risk for consistent activity over time
        if (walletDetails.profile.firstTransactionDate) {
            const ageInDays = Math.floor((new Date().getTime() - walletDetails.profile.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (ageInDays > 365) {
                score -= 15;
            }
            else if (ageInDays > 180) {
                score -= 10;
            }
            else if (ageInDays > 30) {
                score -= 5;
            }
        }
        // Higher risk for very recent wallets with high value
        if (walletDetails.profile.firstTransactionDate) {
            const ageInDays = Math.floor((new Date().getTime() - walletDetails.profile.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (ageInDays < 30 && parseFloat(walletDetails.balance.native) > 10) {
                score += 20;
            }
        }
        // Interaction with unusual or suspect tokens increases risk
        const suspectTokens = walletDetails.tokens.filter(token => token.name.includes('reward') ||
            token.name.includes('claim') ||
            token.name.includes('airdrop') ||
            token.name.includes('Visit') ||
            token.symbol.includes('$'));
        score += suspectTokens.length * 3;
        // Limit to 0-100 range
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Determine activity level based on transaction history
     */
    determineActivityLevel(transactions) {
        if (transactions.length === 0) {
            return 'Dormant';
        }
        // Check how recent the last transaction is
        const lastTxTimestamp = Math.max(...transactions.map(tx => tx.timestamp));
        const daysSinceLastTx = Math.floor((Date.now() / 1000 - lastTxTimestamp) / (60 * 60 * 24));
        if (daysSinceLastTx > 180) {
            return 'Dormant';
        }
        else if (daysSinceLastTx > 30) {
            return 'Inactive';
        }
        else if (daysSinceLastTx > 7) {
            return 'Casual';
        }
        // If transactions in the last week, check frequency
        if (transactions.length > 100) {
            return 'Very Active';
        }
        else if (transactions.length > 50) {
            return 'Active';
        }
        else if (transactions.length > 20) {
            return 'Moderate';
        }
        else {
            return 'Casual';
        }
    }
    /**
     * Get preferred tokens based on balance
     */
    getPreferredTokens(tokens) {
        // Sort tokens by USD value and get top 5
        return tokens
            .filter(token => token.symbol && token.symbol.length > 0 && !token.symbol.includes('http'))
            .sort((a, b) => b.usdValue - a.usdValue)
            .slice(0, 5)
            .map(token => token.symbol);
    }
    /**
     * Determine wallet age in human-readable format
     */
    determineWalletAge(walletDetails) {
        if (!walletDetails.profile.firstTransactionDate) {
            return 'Unknown';
        }
        const ageInDays = Math.floor((new Date().getTime() - walletDetails.profile.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (ageInDays > 365 * 2) {
            return `${Math.floor(ageInDays / 365)} years`;
        }
        else if (ageInDays > 365) {
            return '1+ year';
        }
        else if (ageInDays > 30) {
            return `${Math.floor(ageInDays / 30)} months`;
        }
        else {
            return `${ageInDays} days`;
        }
    }
    /**
     * Get top NFT collections based on count
     */
    getTopCollections(nfts) {
        const collections = new Map();
        nfts.forEach(nft => {
            if (nft.name && nft.name.length > 0) {
                const name = nft.name;
                collections.set(name, (collections.get(name) || 0) + 1);
            }
        });
        // Convert to array, sort by count, and take top 5
        return Array.from(collections.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }
    /**
     * Generate activity summary with key metrics
     */
    generateActivitySummary(walletDetails) {
        const transactions = walletDetails.transactions;
        // Calculate average transaction value
        const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        const avgValue = transactions.length > 0 ? totalValue / transactions.length : 0;
        // Determine trading frequency
        let tradingFrequency = 'Low';
        if (transactions.length > 100) {
            tradingFrequency = 'Very High';
        }
        else if (transactions.length > 50) {
            tradingFrequency = 'High';
        }
        else if (transactions.length > 20) {
            tradingFrequency = 'Medium';
        }
        // Get last activity date
        let lastActivity = null;
        if (transactions.length > 0) {
            const lastTxTimestamp = Math.max(...transactions.map(tx => tx.timestamp));
            lastActivity = new Date(lastTxTimestamp * 1000);
        }
        // Calculate total inflow and outflow
        const totalInflow = transactions
            .filter(tx => tx.type === 'incoming')
            .reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        const totalOutflow = transactions
            .filter(tx => tx.type === 'outgoing')
            .reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        return {
            avgTransactionValue: avgValue,
            tradingFrequency,
            lastActivity,
            totalInflow,
            totalOutflow
        };
    }
    /**
     * Generate relevant tags for the wallet
     */
    generateTags(walletDetails, categories, activeLevel) {
        const tags = [...categories];
        // Add activity level
        tags.push(activeLevel);
        // Add ENS tag if present
        if (walletDetails.profile.ensName) {
            tags.push('ENS Owner');
        }
        // Add balance-based tags
        const ethBalance = parseFloat(walletDetails.balance.native);
        if (ethBalance > 100) {
            tags.push('High Balance');
        }
        else if (ethBalance > 10) {
            tags.push('Medium Balance');
        }
        else {
            tags.push('Low Balance');
        }
        // Add NFT-related tags
        if (walletDetails.nfts.length > 20) {
            tags.push('NFT Enthusiast');
        }
        else if (walletDetails.nfts.length > 0) {
            tags.push('NFT Holder');
        }
        // DeFi tags
        if (walletDetails.defiPositions.length > 0) {
            tags.push('DeFi User');
        }
        return [...new Set(tags)]; // Remove duplicates
    }
    /**
     * Generate personalized recommendations based on wallet profile
     */
    generateRecommendations(walletDetails, categories) {
        const recommendations = {
            tokens: [],
            nfts: [],
            dapps: []
        };
        // For empty or inactive wallets, provide starter recommendations
        if (walletDetails.transactions.length === 0 && parseFloat(walletDetails.balance.native) === 0) {
            recommendations.tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'];
            recommendations.dapps = ['Uniswap', 'Aave', 'Lido', 'ENS', 'OpenSea'];
            recommendations.nfts = ['ENS Domains', 'Pudgy Penguins', 'Base Ghosts', 'Checks', 'Moonbirds'];
            return recommendations;
        }
        // Token recommendations based on existing holdings and categories
        if (categories.includes('DeFi Investor')) {
            const defiTokens = ['AAVE', 'COMP', 'MKR', 'UNI', 'CRV', 'BAL', 'SNX'];
            const existingTokens = walletDetails.tokens.map(t => t.symbol.toUpperCase());
            recommendations.tokens = defiTokens.filter(t => !existingTokens.includes(t)).slice(0, 3);
            // Add DeFi dApps
            recommendations.dapps.push('Aave', 'Compound', 'Uniswap', 'Curve');
        }
        if (categories.includes('NFT Collector')) {
            recommendations.nfts.push('Bored Ape Yacht Club', 'Azuki', 'Doodles', 'CryptoPunks');
            recommendations.dapps.push('OpenSea', 'Blur', 'Rarible');
        }
        if (categories.includes('Active Trader')) {
            recommendations.dapps.push('dYdX', 'GMX', 'Uniswap');
            recommendations.tokens.push('ETH', 'BTC', 'ARB', 'OP');
        }
        if (categories.includes('DAO Member')) {
            recommendations.dapps.push('Snapshot', 'Tally', 'Boardroom');
        }
        if (categories.includes('Meme Token Enthusiast')) {
            recommendations.tokens.push('SHIB', 'FLOKI', 'PEPE');
        }
        // Default recommendations if no specific matches
        if (recommendations.tokens.length === 0) {
            recommendations.tokens = ['ETH', 'LINK', 'UNI', 'ARB'];
        }
        if (recommendations.dapps.length === 0) {
            recommendations.dapps = ['Uniswap', 'OpenSea', 'Lido'];
        }
        // Limit to unique values
        recommendations.tokens = [...new Set(recommendations.tokens)].slice(0, 5);
        recommendations.nfts = [...new Set(recommendations.nfts)].slice(0, 5);
        recommendations.dapps = [...new Set(recommendations.dapps)].slice(0, 5);
        return recommendations;
    }
    /**
     * Generate a personality bio based on wallet analysis
     */
    generateBio(walletDetails, categories, activeLevel, preferredTokens, topCollections) {
        // Special case for empty wallets
        if (walletDetails.transactions.length === 0 && parseFloat(walletDetails.balance.native) === 0) {
            return 'This appears to be an inactive or newly created wallet address with no on-chain history yet. It may be a backup wallet, a newly generated address, or simply dormant.';
        }
        let bio = '';
        // Intro based on categories and activity
        if (categories.includes('Whale')) {
            bio += 'A significant player in the Ethereum ecosystem with substantial holdings. ';
        }
        else if (categories.includes('NFT Collector')) {
            bio += 'A passionate collector of digital art and NFTs. ';
        }
        else if (categories.includes('DeFi Investor')) {
            bio += 'A savvy DeFi investor navigating the decentralized finance landscape. ';
        }
        else if (categories.includes('Active Trader')) {
            bio += 'An active trader constantly looking for opportunities in the market. ';
        }
        else if (categories.includes('DAO Member')) {
            bio += 'A governance participant helping shape the future of decentralized protocols. ';
        }
        else if (categories.includes('Meme Token Enthusiast')) {
            bio += 'An enthusiast of the lighter side of crypto, with interests in meme tokens. ';
        }
        else {
            bio += 'A blockchain explorer venturing through the Ethereum ecosystem. ';
        }
        // Activity level
        bio += `${activeLevel} on the network`;
        // Wallet age
        if (walletDetails.profile.firstTransactionDate) {
            const ageInDays = Math.floor((new Date().getTime() - walletDetails.profile.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (ageInDays > 365 * 2) {
                bio += `, with over ${Math.floor(ageInDays / 365)} years of on-chain history`;
            }
            else if (ageInDays > 365) {
                bio += ', with over a year of on-chain history';
            }
            else if (ageInDays > 90) {
                bio += `, with ${Math.floor(ageInDays / 30)} months of on-chain history`;
            }
        }
        bio += '. ';
        // Token preferences
        if (preferredTokens.length > 0) {
            bio += `Frequently interacts with ${preferredTokens.slice(0, 3).join(', ')}`;
            // NFT collections if applicable
            if (topCollections.length > 0) {
                bio += ` and collects ${topCollections.slice(0, 2).join(', ')} NFTs`;
            }
            bio += '. ';
        }
        // ENS mention
        if (walletDetails.profile.ensName) {
            bio += `Known on-chain as ${walletDetails.profile.ensName}. `;
        }
        return bio;
    }
    /**
     * Generate visualizations for the wallet data
     */
    generateVisualizations(walletDetails, riskScore) {
        return {
            balanceDistribution: this.generateBalanceDistributionChart(walletDetails),
            activityPattern: this.generateActivityPatternChart(walletDetails.transactions),
            riskVisualization: this.generateRiskVisualization(riskScore)
        };
    }
    /**
     * Generate a simple ASCII chart of balance distribution
     */
    generateBalanceDistributionChart(walletDetails) {
        const tokens = walletDetails.tokens
            .filter(token => token.symbol && token.symbol.length > 0 && !token.symbol.includes('http'))
            .sort((a, b) => b.usdValue - a.usdValue)
            .slice(0, 5);
        const nativeValue = parseFloat(walletDetails.balance.native);
        // If wallet is empty with no tokens
        if (nativeValue === 0 && tokens.length === 0) {
            return `  No assets found in this wallet.\n\n` +
                `  Possible next steps:\n` +
                `  - Fund with ETH to start on-chain activity\n` +
                `  - Bridge assets from other networks\n` +
                `  - Receive tokens or NFTs from another wallet`;
        }
        // Add native ETH balance to the distribution
        const values = [
            { name: 'ETH', value: nativeValue > 0 ? nativeValue : 0.0001 },
            ...tokens.map(token => ({
                name: token.symbol,
                value: token.usdValue > 0 ? token.usdValue : 0.0001
            }))
        ];
        // Find max for scaling
        const maxValue = Math.max(...values.map(v => v.value));
        // Generate the chart
        let chart = '  Asset Distribution (relative scale)\n';
        chart += '  -----------------------------------\n';
        values.forEach(item => {
            const barLength = Math.max(1, Math.round((item.value / maxValue) * 20));
            const bar = '█'.repeat(barLength);
            chart += `  ${item.name.padEnd(6)}: ${bar} ${item.value.toFixed(4)}\n`;
        });
        return chart;
    }
    /**
     * Generate a simple ASCII chart of activity patterns
     */
    generateActivityPatternChart(transactions) {
        if (transactions.length === 0) {
            return `  No transaction history available for this wallet.\n\n` +
                `  This could be because:\n` +
                `  - The wallet is newly created\n` +
                `  - It's a cold storage wallet not yet used\n` +
                `  - Transactions might exist on other networks\n` +
                `  - The wallet may be waiting for initial funding`;
        }
        // Group transactions by type (incoming/outgoing)
        const incoming = transactions.filter(tx => tx.type === 'incoming');
        const outgoing = transactions.filter(tx => tx.type === 'outgoing');
        // Get transaction counts
        const inCount = incoming.length;
        const outCount = outgoing.length;
        const totalCount = transactions.length;
        // Calculate percentages for the chart (ensure at least 1 block for visual representation)
        const inPercentage = Math.max(1, Math.round((inCount / totalCount) * 20));
        const outPercentage = Math.max(1, Math.round((outCount / totalCount) * 20));
        // Build the chart
        let chart = '  Transaction Pattern\n';
        chart += '  -----------------\n';
        chart += `  Incoming [${inCount}]: ${'▓'.repeat(inPercentage)}\n`;
        chart += `  Outgoing [${outCount}]: ${'▒'.repeat(outPercentage)}\n`;
        // Add recency analysis if there are transactions
        if (transactions.length > 0) {
            const timestamps = transactions.map(tx => tx.timestamp);
            const oldestTx = new Date(Math.min(...timestamps) * 1000);
            const newestTx = new Date(Math.max(...timestamps) * 1000);
            chart += '\n  Transaction Timeline\n';
            chart += '  -------------------\n';
            chart += `  First: ${oldestTx.toLocaleDateString()}\n`;
            chart += `  Last:  ${newestTx.toLocaleDateString()}\n`;
            // Generate a simple activity heatmap based on transaction frequency
            chart += '\n  Activity Heatmap (last 5 transactions)\n';
            chart += '  ----------------------------------\n';
            const latestTransactions = transactions
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);
            latestTransactions.forEach((tx, index) => {
                const date = new Date(tx.timestamp * 1000);
                chart += `  ${date.toLocaleDateString()}: ${'■'.repeat(5 - index)} ${tx.type} ${parseFloat(tx.value).toFixed(4)} ETH\n`;
            });
        }
        return chart;
    }
    /**
     * Generate a visual representation of the risk score
     */
    generateRiskVisualization(riskScore) {
        const total = 10;
        const filled = Math.round((riskScore / 100) * total);
        const empty = total - filled;
        const riskBar = '█'.repeat(filled) + '░'.repeat(empty);
        let riskText = 'Low Risk';
        if (riskScore >= 80)
            riskText = 'Very High Risk';
        else if (riskScore >= 60)
            riskText = 'High Risk';
        else if (riskScore >= 40)
            riskText = 'Medium Risk';
        else if (riskScore >= 20)
            riskText = 'Low Risk';
        else
            riskText = 'Very Low Risk';
        return `  Risk Meter: [${riskBar}] ${riskScore}/100 - ${riskText}`;
    }
}
exports.WalletPersonaService = WalletPersonaService;
