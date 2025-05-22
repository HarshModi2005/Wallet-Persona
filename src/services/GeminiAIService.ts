import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY not provided. AI features will be limited.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Analyze wallet transactions and generate insights
   */
  async analyzeTransactions(transactions: any, balance: string): Promise<any> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultAnalysis(transactions, balance);
    }

    try {
      const prompt = `
        As a blockchain analysis expert, analyze this Ethereum wallet:
        
        Balance: ${balance} ETH
        Transaction history (last 6 months): ${JSON.stringify(transactions)}
        
        Please provide:
        1. A trading behavior profile (frequency, patterns, etc.)
        2. An activity level classification (Very Active, Active, Casual, Inactive)
        3. A risk assessment (Low, Medium, High) with reasons
        4. A brief persona description/bio of the wallet owner based on their on-chain activity
        5. Suggested tokens they might be interested in
        6. Relevant dApps they should explore

        Format your response as a JSON object with these fields:
        {
          "tradingProfile": string,
          "activityLevel": string,
          "riskAssessment": { "level": string, "score": number, "factors": string[] },
          "bio": string,
          "suggestedTokens": string[],
          "suggestedDapps": string[]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.warn('Failed to parse Gemini response as JSON');
        return this.getDefaultAnalysis(transactions, balance);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      return this.getDefaultAnalysis(transactions, balance);
    }
  }

  /**
   * Generate sophisticated asset recommendations based on wallet activity
   */
  async generateRecommendations(walletData: any): Promise<any> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultRecommendations();
    }

    try {
      const prompt = `
        As a DeFi and crypto investment advisor, recommend assets and dApps for this Ethereum wallet:
        
        Current holdings: ${JSON.stringify(walletData.assets)}
        Trading behavior: ${walletData.tradingProfile || 'Unknown'}
        Activity level: ${walletData.activityLevel || 'Casual'}
        
        Please provide:
        1. Top 5 tokens this wallet should explore next
        2. Top 3 DeFi protocols that would be valuable
        3. Brief reasoning for each recommendation
        
        Format your response as a JSON object with these fields:
        {
          "tokens": [
            { "symbol": string, "name": string, "reasoning": string }
          ],
          "dapps": [
            { "name": string, "category": string, "reasoning": string }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.warn('Failed to parse Gemini response as JSON');
        return this.getDefaultRecommendations();
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Generate a comprehensive bio for the wallet owner
   */
  async generateWalletBio(walletData: any): Promise<string> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultBio(walletData);
    }

    try {
      const prompt = `
        Generate a concise, engaging bio for an Ethereum wallet with:
        
        Balance: ${walletData.balance} ETH
        Age: ${walletData.age} days
        Trading profile: ${walletData.tradingProfile || 'Casual'}
        Activity level: ${walletData.activityLevel || 'Low'}
        Risk score: ${walletData.riskScore || 50}/100
        
        Make it sound personable, under 30 words, and focus on their blockchain behavior.
        Do NOT include any financial advice or speculative statements.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const bio = response.text().trim();
      
      return bio.length > 200 ? bio.substring(0, 197) + '...' : bio;
    } catch (error) {
      console.error('Error generating wallet bio:', error);
      return this.getDefaultBio(walletData);
    }
  }

  /**
   * Default analysis when Gemini API is unavailable
   */
  private getDefaultAnalysis(transactions: any, balance: string): any {
    // Analyze inflow/outflow to determine activity level
    const totalInflow = transactions.inflow.reduce((sum: number, val: number) => sum + val, 0);
    const totalOutflow = transactions.outflow.reduce((sum: number, val: number) => sum + val, 0);
    const totalActivity = totalInflow + totalOutflow;
    
    let activityLevel = 'Inactive';
    if (totalActivity > 3) {
      activityLevel = 'Very Active';
    } else if (totalActivity > 1.5) {
      activityLevel = 'Active';
    } else if (totalActivity > 0.5) {
      activityLevel = 'Casual';
    }
    
    // Determine trading frequency
    const nonZeroMonths = transactions.inflow.filter((val: number) => val > 0).length + 
                          transactions.outflow.filter((val: number) => val > 0).length;
    let tradingProfile = 'Infrequent';
    if (nonZeroMonths > 8) {
      tradingProfile = 'Frequent';
    } else if (nonZeroMonths > 4) {
      tradingProfile = 'Regular';
    } else if (nonZeroMonths > 2) {
      tradingProfile = 'Occasional';
    }
    
    // Calculate risk assessment
    let riskLevel = 'Medium';
    let riskScore = 50;
    let riskFactors = ['Moderate wallet age'];
    
    // Adjust based on activity
    if (totalActivity > 2) {
      riskScore += 10;
      riskFactors.push('High transaction volume');
    } else if (totalActivity < 0.5) {
      riskScore -= 10;
      riskFactors.push('Low transaction volume');
    }
    
    // Adjust based on balance
    const balanceNum = parseFloat(balance);
    if (balanceNum < 0.01) {
      riskScore -= 15;
      riskFactors.push('Low balance');
    } else if (balanceNum > 1) {
      riskScore += 15;
      riskFactors.push('Significant holdings');
    }
    
    // Finalize risk level
    if (riskScore >= 70) {
      riskLevel = 'High';
    } else if (riskScore <= 30) {
      riskLevel = 'Low';
    }
    
    return {
      tradingProfile,
      activityLevel,
      riskAssessment: {
        level: riskLevel,
        score: riskScore,
        factors: riskFactors
      },
      bio: this.getDefaultBio({ activityLevel, tradingProfile }),
      suggestedTokens: ['ETH', 'LINK', 'UNI', 'ARB', 'MATIC'],
      suggestedDapps: ['Uniswap', 'OpenSea', 'Lido', 'Aave']
    };
  }

  /**
   * Default recommendations when Gemini API is unavailable
   */
  private getDefaultRecommendations(): any {
    return {
      tokens: [
        { symbol: 'ETH', name: 'Ethereum', reasoning: 'Base asset for all Ethereum transactions' },
        { symbol: 'LINK', name: 'Chainlink', reasoning: 'Essential oracle service for DeFi' },
        { symbol: 'UNI', name: 'Uniswap', reasoning: 'Leading DEX token' },
        { symbol: 'ARB', name: 'Arbitrum', reasoning: 'Popular L2 scaling solution' },
        { symbol: 'MATIC', name: 'Polygon', reasoning: 'Ethereum scaling solution with growing ecosystem' }
      ],
      dapps: [
        { name: 'Uniswap', category: 'DEX', reasoning: 'Most liquid decentralized exchange' },
        { name: 'OpenSea', category: 'NFT', reasoning: 'Largest NFT marketplace' },
        { name: 'Lido', category: 'Staking', reasoning: 'Popular liquid staking protocol' }
      ]
    };
  }

  /**
   * Default bio when Gemini API is unavailable
   */
  private getDefaultBio(walletData: any): string {
    const activityLevel = walletData.activityLevel || 'Casual';
    const tradingProfile = walletData.tradingProfile || 'Occasional';
    
    return `A blockchain explorer venturing through the Ethereum ecosystem. ${activityLevel} on the network. ${tradingProfile} trader with an interest in DeFi.`;
  }
} 