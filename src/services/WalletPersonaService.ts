import { WalletDetails, Transaction, TokenBalance, NFT, WalletProfile } from '../types/wallet.types';
import { GeminiAIService } from './GeminiAIService';
import { ethers } from 'ethers';
import { ImageGenerationService } from './ImageGenerationService';
import { ElevenLabsService } from './ElevenLabsService';

export interface WalletPersona {
  category: string[];  // investor, collector, trader, DAO member, etc.
  activeLevel: string; // very active, moderate, dormant
  riskScore: number;   // 0-100
  preferredTokens: string[];
  walletAge: string;
  topCollections: string[];
  bio: string;
  avatarName: string;
  avatarBio: string;
  avatarImagePrompt: string;
  avatarIntroScript: string;
  avatarImageUrl?: string | null;
  avatarVoiceUrl?: string | null;
  tags: string[];
  riskFactorsDetails?: {
    deterministicScore: number;
    deterministicFactors: string[];
    aiScore?: number;
    aiFactors?: string[];
    combinedScore: number;
    finalFactors: string[];
  };
  recommendations: {
    tokens: string[];
    nfts: string[];
    dapps: string[];
    actionableInsights: string[];
  };
  activitySummary: {
    lastActivityDate: string | null;
    totalInflowETH: number;
    totalOutflowETH: number;
    avgTransactionValueETH: number;
    transactionCount: number;
  };
  visualization: {
    balanceDistribution: string; // ASCII chart
    activityPattern: string;     // ASCII chart
    riskVisualization: string;   // ASCII representation
  };
  userCategory: string;
  tradingProfile: string;
  profileSummary?: Partial<WalletProfile>;
}

export class WalletPersonaService {
  private aiService: GeminiAIService;
  private imageGenerationService: ImageGenerationService;
  private elevenLabsService: ElevenLabsService;
  private readonly thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  private readonly oneYearInMs = 365 * 24 * 60 * 60 * 1000;

  constructor() {
    this.aiService = new GeminiAIService();
    this.imageGenerationService = new ImageGenerationService(process.env.IMAGE_API_KEY);
    this.elevenLabsService = new ElevenLabsService(process.env.ELEVENLABS_API_KEY);
  }

  async generatePersona(walletDetails: WalletDetails): Promise<WalletPersona> {
    try {
      // Ensure all necessary parts of walletDetails are defined before passing to AI
      const transactionsForAI = walletDetails.transactions || [];
      const walletAddressForAI = walletDetails.address || 'N/A';
      const profileForAI = walletDetails.profile || { 
        address: walletAddressForAI, 
        totalTransactions: 0, 
        totalNftsHeld: 0, 
        uniqueNftCollectionsCount: 0, 
        topNftCollections: [] 
      }; // Basic fallback for profile
      const nftsForAI = walletDetails.nfts || [];
      const balanceDetailsForAI = walletDetails.balance || { native: '0', usdValue: 0, totalTokenUsdValue: 0, grandTotalUsdValue: 0 };
      const erc20TokensForAI = walletDetails.tokens || [];
      const historicalActivityForAI = walletDetails.historicalActivity || [];
      const keyEventsForAI = walletDetails.keyEvents || [];


      const aiAnalysis = await this.aiService.analyzeTransactions(
        transactionsForAI,
        walletAddressForAI,
        profileForAI,
        nftsForAI,
        balanceDetailsForAI,
        erc20TokensForAI,
        historicalActivityForAI,
        keyEventsForAI
        // existingPersonaData can be added here if/when implemented
      );
      
      const deterministicRisk = this._calculateDeterministicRiskScore(walletDetails);

      const combinedRiskScore = Math.round(( (aiAnalysis.riskAssessment.score || 50) + deterministicRisk.score) / 2);
      const finalRiskFactors = [
        ...new Set([
          ...(aiAnalysis.riskAssessment.factors || []),
          ...deterministicRisk.factors
        ])
      ];

      const riskFactorsDetails = {
        deterministicScore: deterministicRisk.score,
        deterministicFactors: deterministicRisk.factors,
        aiScore: aiAnalysis.riskAssessment.score || 50,
        aiFactors: aiAnalysis.riskAssessment.factors || [],
        combinedScore: combinedRiskScore,
        finalFactors: finalRiskFactors
      };
      
      const recommendationsFromAI = await this.aiService.generateRecommendations({
        assets: walletDetails.tokens?.map(t => ({ symbol: t.symbol, name: t.name, balance: t.balance })) || [],
        tradingProfile: aiAnalysis.tradingProfile,
        activityLevel: aiAnalysis.activityLevel,
        currentEthBalance: balanceDetailsForAI.native,
        keyCategories: this.determineWalletCategory(aiAnalysis)
      });

      const formattedRecommendations = {
        tokens: recommendationsFromAI.tokens?.map((token: any) => token.symbol) || [],
        dapps: recommendationsFromAI.dapps?.map((dapp: any) => dapp.name) || [],
        actionableInsights: aiAnalysis.actionableInsights || [],
        nfts: [] // Placeholder for NFT recommendations if added later
      };

      const calculatedWalletAge = this._calculateWalletAge(walletDetails.profile?.firstTransactionDate);
      const calculatedActivitySummary = this._calculateActivitySummary(walletDetails.transactions || []);

      // Construct a temporary persona object for generating the image prompt
      // Ensure all fields expected by generateAvatarImagePrompt are present
      const tempPersonaForImagePrompt = {
        category: this.determineWalletCategory(aiAnalysis),
        activityLevel: aiAnalysis.activityLevel,
        tradingFrequency: aiAnalysis.tradingProfile,
        riskAssessment: aiAnalysis.riskAssessment,
        bio: aiAnalysis.bio,
        avatarName: aiAnalysis.avatarName
      };
      const avatarImagePrompt = await this.aiService.generateAvatarImagePrompt(tempPersonaForImagePrompt);

      // Generate avatar intro script using similar persona details
      const avatarIntroScript = await this.aiService.generateAvatarIntroScript(tempPersonaForImagePrompt);

      // Generate image and voice (placeholders for now)
      const avatarImageUrl = await this.imageGenerationService.generateImageFromPrompt(avatarImagePrompt);
      const avatarVoiceUrl = await this.elevenLabsService.generateVoice(avatarIntroScript);

      // Prepare profileSummary for Chatling
      const profileSummaryForChatling: Partial<WalletProfile> = {
        ensName: profileForAI.ensName,
        unstoppableDomain: profileForAI.unstoppableDomain,
        firstTransactionDate: profileForAI.firstTransactionDate,
        lastTransactionDate: profileForAI.lastTransactionDate,
        totalTransactions: profileForAI.totalTransactions,
        totalNftsHeld: profileForAI.totalNftsHeld,
        uniqueNftCollectionsCount: profileForAI.uniqueNftCollectionsCount,
        uniqueTokenCount: profileForAI.uniqueTokenCount,
        activeChains: profileForAI.activeChains?.slice(0,3)
      };

      // Use personaTags from AI analysis, fallback to a few deterministic ones if AI doesn't provide.
      const finalTags = (aiAnalysis.personaTags && aiAnalysis.personaTags.length > 0) 
        ? aiAnalysis.personaTags 
        : this.generateMinimalDeterministicTags(walletDetails, aiAnalysis);

      return {
        category: this.determineWalletCategory(aiAnalysis),
        userCategory: aiAnalysis.userCategory || "Unknown",
        tags: finalTags, // Use the refined tags
        bio: aiAnalysis.bio,
        avatarName: aiAnalysis.avatarName,
        avatarBio: aiAnalysis.avatarBio,
        avatarImagePrompt,
        avatarIntroScript,
        avatarImageUrl,
        avatarVoiceUrl,
        riskScore: combinedRiskScore,
        riskFactorsDetails,
        activeLevel: aiAnalysis.activityLevel,
        tradingProfile: aiAnalysis.tradingProfile,
        recommendations: formattedRecommendations,
        walletAge: calculatedWalletAge,
        activitySummary: calculatedActivitySummary,
        visualization: {
          balanceDistribution: 'Chart Placeholder',
          activityPattern: 'Activity Placeholder',
          riskVisualization: 'Risk Placeholder'
        },
        profileSummary: profileSummaryForChatling,
        preferredTokens: aiAnalysis.suggestedTokens || [],
        topCollections: profileForAI.topNftCollections?.map(c => c.name || c.contractAddress).slice(0,3) || []
      };
    } catch (error) {
      console.error('Error generating wallet persona:', error);
      return this.getFallbackPersona(walletDetails);
    }
  }

  private _createTransactionSummaryForAI(transactions: Transaction[]): { inflow: number[], outflow: number[], months: string[] } {
    // This method might become redundant if we pass full transactions or if GeminiAIService does this summary.
    // For now, keeping it if other parts of generatePersona (like old recommendation engine) might use its output.
    // If `aiService.analyzeTransactions` now takes raw transactions, this summary is mainly for the old `generateRecommendations`.
    // Consider if `generateRecommendations` in `GeminiAIService` should also take raw transactions or a more detailed profile.
    if (!transactions || transactions.length === 0) {
      return { inflow: [], outflow: [], months: [] };
    }

    const monthlyData: { [monthYear: string]: { inflow: number, outflow: number, monthOrder: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Consider transactions from the last 6-12 months for a relevant summary
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoTimestamp = Math.floor(sixMonthsAgo.getTime() / 1000);

    const relevantTransactions = transactions.filter(tx => tx.timestamp >= sixMonthsAgoTimestamp);
    relevantTransactions.sort((a, b) => a.timestamp - b.timestamp); // Ensure chronological order

    for (const tx of relevantTransactions) {
      const date = new Date(tx.timestamp * 1000);
      const month = date.getMonth(); // 0-11
      const year = date.getFullYear();
      const monthYear = `${monthNames[month]} ${year}`;
      const monthOrder = year * 100 + month; // For sorting chronologically

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { inflow: 0, outflow: 0, monthOrder };
      }

      const valueEth = parseFloat(ethers.formatEther(tx.value || '0'));

      if (tx.type === 'incoming') {
        monthlyData[monthYear].inflow += valueEth;
      } else if (tx.type === 'outgoing') {
        monthlyData[monthYear].outflow += valueEth;
      }
    }

    const sortedMonthYears = Object.keys(monthlyData).sort((a, b) => monthlyData[a].monthOrder - monthlyData[b].monthOrder);
    
    // Take the last 6 available months of data, or fewer if not available
    const recentSortedMonthYears = sortedMonthYears.slice(-6);

    const inflow: number[] = [];
    const outflow: number[] = [];
    const months: string[] = [];

    for (const monthYear of recentSortedMonthYears) {
      inflow.push(parseFloat(monthlyData[monthYear].inflow.toFixed(4)));
      outflow.push(parseFloat(monthlyData[monthYear].outflow.toFixed(4)));
      months.push(monthYear.split(' ')[0]); // Just the month name e.g. "Jan"
    }
    
    // If there's no transaction data for the last 6 months, return a default to avoid empty arrays
    if (months.length === 0) {
        return {
            inflow: [0,0,0,0,0,0],
            outflow: [0,0,0,0,0,0],
            months: monthNames.slice(new Date().getMonth() - 5).concat(monthNames.slice(0, new Date().getMonth() +1)).map(m => m.substring(0,3)) // last 6 month names
        };
    }

    return { inflow, outflow, months };
  }

  private _calculateActivitySummary(transactions: Transaction[]): WalletPersona['activitySummary'] {
    if (!transactions || transactions.length === 0) {
      return {
        lastActivityDate: null,
        totalInflowETH: 0,
        totalOutflowETH: 0,
        avgTransactionValueETH: 0,
        transactionCount: 0
      };
    }

    let lastActivityTimestamp = 0;
    if (transactions.length > 0) {
      lastActivityTimestamp = Math.max(...transactions.map(tx => tx.timestamp));
    }
    const lastActivityDate = lastActivityTimestamp ? new Date(lastActivityTimestamp * 1000).toISOString() : null;

    const totalInflowETH = transactions
      .filter(tx => tx.type === 'incoming')
      .reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.value || '0')), 0); // Convert from wei
    
    const totalOutflowETH = transactions
      .filter(tx => tx.type === 'outgoing')
      .reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.value || '0')), 0); // Convert from wei

    const totalValueETH = transactions.reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.value || '0')), 0);
    const avgTransactionValueETH = transactions.length > 0 ? totalValueETH / transactions.length : 0;
    
    return {
      lastActivityDate,
      totalInflowETH,
      totalOutflowETH,
      avgTransactionValueETH,
      transactionCount: transactions.length
    };
  }

  private _calculateWalletAge(firstTransactionDate?: Date): string {
    if (!firstTransactionDate) {
      return 'Unknown';
    }
    
    const now = new Date().getTime();
    const firstTxTime = new Date(firstTransactionDate).getTime(); // Ensure it's a Date object then getTime
    
    if (isNaN(firstTxTime)) return 'Unknown'; // Invalid date from backend

    const ageInMs = now - firstTxTime;

    if (ageInMs < 0) return 'Future Wallet? (check date)'; // Edge case for clock sync issues

    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    if (ageInDays === 0) return 'Today';
    if (ageInDays < 0) return 'Unknown'; // Should be caught by future wallet check

    if (ageInDays > 365 * 2) {
      return `${Math.floor(ageInDays / 365)} years`;
    } else if (ageInDays > 365) {
      return '1+ year';
    } else if (ageInDays > 30) {
      return `${Math.floor(ageInDays / 30)} months`;
    } else {
      return `${ageInDays} day${ageInDays > 1 ? 's' : ''}`;
    }
  }

  private determineWalletCategory(analysis: any): string[] {
    // Logic to determine categories based on AI analysis (tradingProfile, activityLevel, etc.)
    // This should now use analysis.userCategory if available, or derive from others.
    const categories: string[] = [];
    if (analysis.userCategory) {
        categories.push(analysis.userCategory);
    }
    // Fallback or additional logic if userCategory is not comprehensive
    if (analysis.tradingProfile?.toLowerCase().includes('nft')) categories.push("NFT Enthusiast");
    if (analysis.tradingProfile?.toLowerCase().includes('defi')) categories.push("DeFi User");
    if (categories.length === 0) categories.push("General User");
    return [...new Set(categories)]; // Return unique categories
  }

  private generateWalletTags(analysis: any, walletDetails: WalletDetails, balanceString: string): string[] {
    // This method is now primarily a fallback or can be used to *supplement* AI tags if needed.
    // For the main persona object, we should prefer aiAnalysis.personaTags.
    
    // If AI provided specific personaTags, use them primarily.
    if (analysis.personaTags && analysis.personaTags.length > 0) {
        // Optional: add 1-2 crucial deterministic tags if not covered by AI and they are concise.
        const deterministicTags = this.generateMinimalDeterministicTags(walletDetails, analysis);
        return [...new Set([...analysis.personaTags, ...deterministicTags])].slice(0,5); // Combine and limit
    }

    // Fallback to old logic if AI personaTags are missing
    const tags: string[] = [];
    
    // Add activity level tag
    if (analysis.activityLevel) {
      tags.push(analysis.activityLevel);
    }
    
    // Add balance-based tag
    const balance = parseFloat(balanceString);
    if (balance < 0.01) {
      tags.push('Low Balance');
    } else if (balance > 1) {
      tags.push('High Balance');
    } else {
      tags.push('Medium Balance');
    }
    
    // Add risk-based tag
    if (analysis.riskAssessment.level === 'High') {
      tags.push('High Risk');
    }
    
    // Add trading behavior tag
    if (analysis.tradingProfile === 'Frequent') {
      tags.push('Active Trader');
    }
    
    if (analysis.userCategory) tags.push(analysis.userCategory);
    if (analysis.tradingProfile) tags.push(analysis.tradingProfile);
    if (analysis.activityLevel) tags.push(analysis.activityLevel);

    // Add tags from deterministic risk factors if they are concise
    const deterministicRisk = this._calculateDeterministicRiskScore(walletDetails);
    deterministicRisk.factors.forEach(factor => {
        if (factor.length < 20 && !tags.some(t => factor.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(factor.toLowerCase())) ) { // Keep tags relatively short & distinct
            tags.push(factor.replace(/\s+/g, '-').replace(/\(.*?\)/g, '').replace(/降低风险|增加风险/g, '').trim().substring(0,15));
        }
    });
    
    return [...new Set(tags)].slice(0, 5); // Limit to 5 tags max, ensure uniqueness
  }

  private getFallbackPersona(walletDetails: WalletDetails): WalletPersona {
    const calculatedWalletAge = this._calculateWalletAge(walletDetails.profile?.firstTransactionDate);
    const calculatedActivitySummary = this._calculateActivitySummary(walletDetails.transactions || []);
    const deterministicRisk = this._calculateDeterministicRiskScore(walletDetails);
    
    return {
      category: ["General User"],
      userCategory: "General User",
      tags: ["Needs Review", "General User"], // Simplified fallback tags
      bio: "This wallet persona is currently under construction. More details will be available soon as more on-chain data is analyzed.",
      avatarName: "Data Seeker",
      avatarBio: "Analyzing the chain...",
      avatarImagePrompt: "A futuristic abstract representation of data streams and blockchain nodes, blue and purple hues.",
      avatarIntroScript: "Hello, I am still gathering information to fully introduce myself. Please check back later!",
      avatarImageUrl: null,
      avatarVoiceUrl: null,
      riskScore: deterministicRisk.score,
      riskFactorsDetails: {
        deterministicScore: deterministicRisk.score,
        deterministicFactors: deterministicRisk.factors,
        aiScore: 0, 
        aiFactors: [], 
        combinedScore: deterministicRisk.score, 
        finalFactors: deterministicRisk.factors,
      },
      activeLevel: "Unknown",
      tradingProfile: "Unknown",
      recommendations: {
        tokens: ["ETH", "WBTC"],
        nfts: ["Consider exploring popular NFT marketplaces like OpenSea."],
        dapps: ["Major DEX (e.g., Uniswap)", "Major Lending Protocol (e.g., Aave)"],
        actionableInsights: ["Ensure your wallet software is up to date."]
      },
      walletAge: calculatedWalletAge,
      activitySummary: calculatedActivitySummary,
      visualization: { 
        balanceDistribution: "No data available for chart.", 
        activityPattern: "No data available for chart.", 
        riskVisualization: "Risk assessment pending data." 
      }, 
      profileSummary: undefined,
      preferredTokens: [],
      topCollections: []
    };
  }

  private _calculateDeterministicRiskScore(walletDetails: WalletDetails): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 50; // Start at medium risk

    const transactions = walletDetails.transactions || [];
    const nativeBalance = parseFloat(walletDetails.balance?.native || '0');
    const firstTransactionDate = walletDetails.profile?.firstTransactionDate;

    // Factor 1: Wallet Age and History
    if (transactions.length === 0 && nativeBalance === 0) {
      score = 15;
      factors.push('Empty and inactive wallet.');
    } else {
      if (transactions.length > 100) {
        score -= 10;
        factors.push('Extensive transaction history (降低风险).');
      } else if (transactions.length < 10) {
        score += 10;
        factors.push('Limited transaction history (增加风险).');
      }

      if (firstTransactionDate) {
        const ageInDays = Math.floor((new Date().getTime() - new Date(firstTransactionDate).getTime()) / (1000 * 60 * 60 * 24));
        if (ageInDays > 365) {
          score -= 15;
          factors.push(`Wallet age: ${Math.floor(ageInDays / 365)} years (降低风险).`);
        } else if (ageInDays > 180) {
          score -= 10;
          factors.push(`Wallet age: ${Math.floor(ageInDays / 30)} months (降低风险).`);
        } else if (ageInDays < 30) {
          score += 15;
          factors.push('Very new wallet (less than 30 days) (增加风险).');
          if (nativeBalance > 10) {
            score += 10;
            factors.push('New wallet with significant initial balance (>10 ETH) (增加风险).');
          }
        }
      } else {
        score += 10;
        factors.push('Wallet creation date unknown (增加风险).');
      }
    }

    // Factor 2: Suspicious Token Interactions
    const spamKeywords = [
        'reward', 'claim', 'airdrop', 'gift', '.io', '.net', '.xyz', '.site',
        'bonus', 'giveaway', 'free', 'winner', 'prize', 'collect', 'official',
        'support', 'help', 'customer', 'service', 'alert', 'warning',
        'key', 'pass', 'secret', 'tokenlon', 'walletnow', // From WalletService
        'visit', // Common in scam descriptions
    ];
    const suspectTokens = (walletDetails.tokens || []).filter(token => {
      const tokenNameLower = (token.name || '').toLowerCase();
      const tokenSymbolLower = (token.symbol || '').toLowerCase();
      if (tokenNameLower.includes('http')) return true;
      if (!tokenSymbolLower || tokenSymbolLower.length > 10) return true; // No symbol or very long
      return spamKeywords.some(keyword => tokenNameLower.includes(keyword) || tokenSymbolLower.includes(keyword));
    });

    if (suspectTokens.length > 0) {
      score += Math.min(suspectTokens.length * 5, 25); // Cap penalty
      factors.push(`Interacted with ${suspectTokens.length} potentially suspicious token(s) (增加风险).`);
    }
    
    // Factor 3: Transaction Patterns (Placeholders for more complex logic)
    // Placeholder: High percentage of outgoing transactions to new/unverified addresses
    // This would require tracking addresses interacted with over time.
    // For now, a simple check on outflow vs inflow ratio if transaction count is low.
    if (transactions.length > 5 && transactions.length < 50) {
        const outgoingTx = transactions.filter(tx => tx.type === 'outgoing').length;
        const incomingTx = transactions.filter(tx => tx.type === 'incoming').length;
        if (outgoingTx > incomingTx * 2 && incomingTx > 0) { // Significantly more outflow
            score += 10;
            factors.push('High ratio of outgoing to incoming transactions for a moderately active wallet (增加风险).');
        }
         if (incomingTx === 0 && outgoingTx > 5) {
            score += 15;
            factors.push('Wallet primarily used for sending funds with few deposits (增加风险).');
        }
    }


    // Factor 4: Low balance for prolonged period with high transaction volume (Placeholder)
    // This requires historical balance data alongside transactions.
    // Example: if (avgBalance < 0.01 ETH && totalTransactions > 100) { score += 10; factors.push(...); }
    if (nativeBalance < 0.01 && transactions.length > 50) {
        score += 10;
        factors.push('Low balance despite high transaction volume (potential burner activity) (增加风险).');
    }


    // Factor 5: Interaction with unverified contracts (Placeholder)
    // This requires a mechanism to check contract verification status (e.g., Etherscan API)
    // Example: if (interactedWithUnverifiedContracts > 3) { score += 15; factors.push(...); }
    factors.push('Contract verification status not currently analyzed (neutral).');
    
    // Factor 6: Age of contracts interacted with (Placeholder)
    // This requires fetching contract creation dates.
    // Example: if (avgContractAge < 30 days) { score += 10; factors.push(...); }
    factors.push('Age of interacted contracts not currently analyzed (neutral).');


    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    return { score, factors };
  }

  // New helper method for minimal deterministic tags if AI doesn't provide them
  private generateMinimalDeterministicTags(walletDetails: WalletDetails, aiAnalysis: any): string[] {
    const tags: string[] = [];
    if (aiAnalysis.activityLevel) tags.push(aiAnalysis.activityLevel);
    else {
        const activity = this.determineActivityLevel(walletDetails.transactions || []);
        if (activity) tags.push(activity);
    }

    const firstTxDate = walletDetails.profile?.firstTransactionDate;
    if (firstTxDate) {
        const ageInMs = new Date().getTime() - new Date(firstTxDate).getTime();
        if (ageInMs < 30 * 24 * 60 * 60 * 1000) { // Less than 30 days old
            tags.push("New Wallet");
        }
    }
    // Add one or two more very generic but distinct tags if needed
    if (walletDetails.nfts && walletDetails.nfts.length > 5) tags.push("NFT Holder");
    
    return [...new Set(tags)].slice(0, 5); // Ensure unique and limit count
  }
  
  /**
   * Determine wallet categories based on activity patterns
   */
  private determineCategory(walletDetails: WalletDetails): string[] {
    const categories: string[] = [];
    
    // NFT Collector check
    if (walletDetails.nfts.length > 5) {
      categories.push('NFT Collector');
    }
    
    // DeFi Investor check
    const defiTokens = ['AAVE', 'COMP', 'MKR', 'UNI', 'SUSHI', 'YFI', 'CRV', 'BAL'];
    const hasDefiTokens = walletDetails.tokens.some(token => 
      defiTokens.includes(token.symbol.toUpperCase())
    );
    if (hasDefiTokens || (walletDetails.defiSummary && walletDetails.defiSummary.total_positions > 0)) {
      categories.push('DeFi Investor');
    }
    
    // Trader check - high transaction count
    if (walletDetails.transactions.length > 50) {
      categories.push('Active Trader');
    }
    
    // DAO Member check - governance tokens
    const governanceTokens = ['UNI', 'COMP', 'MKR', 'AAVE', 'ENS', 'DYDX', 'OP', 'ARB'];
    const hasGovernanceTokens = walletDetails.tokens.some(token => 
      governanceTokens.includes(token.symbol.toUpperCase())
    );
    if (hasGovernanceTokens) {
      categories.push('DAO Member');
    }
    
    // Whale check - large ETH balance
    if (parseFloat(walletDetails.balance.native) > 100) {
      categories.push('Whale');
    }
    
    // Meme Token Enthusiast
    const memeTokens = ['SHIB', 'DOGE', 'PEPE', 'FLOKI', 'ELON'];
    const hasMemeTokens = walletDetails.tokens.some(token => 
      memeTokens.includes(token.symbol.toUpperCase())
    );
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
  private calculateRiskScore(walletDetails: WalletDetails): number {
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
      } else if (ageInDays > 180) {
        score -= 10;
      } else if (ageInDays > 30) {
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
    const suspectTokens = walletDetails.tokens.filter(token => 
      token.name.includes('reward') || 
      token.name.includes('claim') || 
      token.name.includes('airdrop') ||
      token.name.includes('Visit') ||
      token.symbol.includes('$')
    );
    
    score += suspectTokens.length * 3;
    
    // Limit to 0-100 range
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Determine activity level based on transaction history
   */
  private determineActivityLevel(transactions: Transaction[]): string {
    if (transactions.length === 0) {
      return 'Dormant';
    }
    
    // Check how recent the last transaction is
    const lastTxTimestamp = Math.max(...transactions.map(tx => tx.timestamp));
    const daysSinceLastTx = Math.floor((Date.now() / 1000 - lastTxTimestamp) / (60 * 60 * 24));
    
    if (daysSinceLastTx > 180) {
      return 'Dormant';
    } else if (daysSinceLastTx > 30) {
      return 'Inactive';
    } else if (daysSinceLastTx > 7) {
      return 'Casual';
    }
    
    // If transactions in the last week, check frequency
    if (transactions.length > 100) {
      return 'Very Active';
    } else if (transactions.length > 50) {
      return 'Active';
    } else if (transactions.length > 20) {
      return 'Moderate';
    } else {
      return 'Casual';
    }
  }
  
  /**
   * Get preferred tokens based on balance
   */
  private getPreferredTokens(tokens: TokenBalance[]): string[] {
    // Sort tokens by USD value and get top 5
    return tokens
      .filter(token => token.symbol && token.symbol.length > 0 && !token.symbol.includes('http'))
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 5)
      .map(token => token.symbol);
  }
  
  /**
   * Get top NFT collections based on count
   */
  private getTopCollections(nfts: NFT[]): string[] {
    const collections = new Map<string, number>();
    
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
   * Generate a personality bio based on wallet analysis
   */
  private generateBio(
    walletDetails: WalletDetails, 
    categories: string[], 
    activeLevel: string,
    preferredTokens: string[],
    topCollections: string[]
  ): string {
    // Special case for empty wallets
    if (walletDetails.transactions.length === 0 && parseFloat(walletDetails.balance.native) === 0) {
      return 'This appears to be an inactive or newly created wallet address with no on-chain history yet. It may be a backup wallet, a newly generated address, or simply dormant.';
    }
    
    let bio = '';
    
    // Intro based on categories and activity
    if (categories.includes('Whale')) {
      bio += 'A significant player in the Ethereum ecosystem with substantial holdings. ';
    } else if (categories.includes('NFT Collector')) {
      bio += 'A passionate collector of digital art and NFTs. ';
    } else if (categories.includes('DeFi Investor')) {
      bio += 'A savvy DeFi investor navigating the decentralized finance landscape. ';
    } else if (categories.includes('Active Trader')) {
      bio += 'An active trader constantly looking for opportunities in the market. ';
    } else if (categories.includes('DAO Member')) {
      bio += 'A governance participant helping shape the future of decentralized protocols. ';
    } else if (categories.includes('Meme Token Enthusiast')) {
      bio += 'An enthusiast of the lighter side of crypto, with interests in meme tokens. ';
    } else {
      bio += 'A blockchain explorer venturing through the Ethereum ecosystem. ';
    }
    
    // Activity level
    bio += `${activeLevel} on the network`;
    
    // Wallet age
    if (walletDetails.profile.firstTransactionDate) {
      const ageInDays = Math.floor((new Date().getTime() - walletDetails.profile.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (ageInDays > 365 * 2) {
        bio += `, with over ${Math.floor(ageInDays / 365)} years of on-chain history`;
      } else if (ageInDays > 365) {
        bio += ', with over a year of on-chain history';
      } else if (ageInDays > 90) {
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
  private generateVisualizations(walletDetails: WalletDetails, riskScore: number): WalletPersona['visualization'] {
    return {
      balanceDistribution: this.generateBalanceDistributionChart(walletDetails),
      activityPattern: this.generateActivityPatternChart(walletDetails.transactions),
      riskVisualization: this.generateRiskVisualization(riskScore)
    };
  }

  /**
   * Generate a simple ASCII chart of balance distribution
   */
  private generateBalanceDistributionChart(walletDetails: WalletDetails): string {
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
  private generateActivityPatternChart(transactions: Transaction[]): string {
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
  private generateRiskVisualization(riskScore: number): string {
    const total = 10;
    const filled = Math.round((riskScore / 100) * total);
    const empty = total - filled;
    
    const riskBar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let riskText = 'Low Risk';
    if (riskScore >= 80) riskText = 'Very High Risk';
    else if (riskScore >= 60) riskText = 'High Risk';
    else if (riskScore >= 40) riskText = 'Medium Risk';
    else if (riskScore >= 20) riskText = 'Low Risk';
    else riskText = 'Very Low Risk';
    
    return `  Risk Meter: [${riskBar}] ${riskScore}/100 - ${riskText}`;
  }

  /**
   * Generate personalized recommendations based on wallet profile
   */
  private generateRecommendations(walletDetails: WalletDetails, categories: string[]): WalletPersona['recommendations'] {
    const recommendations = {
      tokens: [] as string[],
      nfts: [] as string[],
      dapps: [] as string[],
      actionableInsights: [] as string[]
    };
    
    // For empty or inactive wallets, provide starter recommendations
    if (walletDetails.transactions.length === 0 && parseFloat(walletDetails.balance.native) === 0) {
      recommendations.tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC'];
      recommendations.dapps = ['Uniswap', 'Aave', 'Lido', 'ENS', 'OpenSea'];
      recommendations.nfts = ['ENS Domains', 'Pudgy Penguins', 'Base Ghosts', 'Checks', 'Moonbirds'];
      recommendations.actionableInsights = ["Ensure your wallet software is up to date.", "Consider diversifying your portfolio."];
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
    
    // Add actionable insights
    recommendations.actionableInsights = ["Ensure your wallet software is up to date.", "Consider diversifying your portfolio."];
    
    return recommendations;
  }

  /**
   * Generate relevant tags for the wallet
   */
  private generateTags(walletDetails: WalletDetails, categories: string[], activeLevel: string): string[] {
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
    } else if (ethBalance > 10) {
      tags.push('Medium Balance');
    } else {
      tags.push('Low Balance');
    }
    
    // Add NFT-related tags
    if (walletDetails.nfts.length > 20) {
      tags.push('NFT Enthusiast');
    } else if (walletDetails.nfts.length > 0) {
      tags.push('NFT Holder');
    }
    
    // DeFi tags
    if (walletDetails.defiSummary && walletDetails.defiSummary.total_positions > 0) {
      tags.push('DeFi User');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
} 