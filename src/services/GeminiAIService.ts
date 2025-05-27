import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY not provided. AI features will be limited.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
        As an AI that embodies and speaks for an Ethereum wallet, analyze the following wallet data for me to understand myself, but also provide some objective analysis for others to see.
        
        Balance: ${balance} ETH
        Transaction history (last 6 months): ${JSON.stringify(transactions)} // This is for your internal analysis only, do not reference it directly in the bio.
        
        Please provide the following information:

        Objective Analysis (for display to others, use third-person):
        1.  A trading behavior profile (e.g., "Frequent Trader", "Occasional Large Swaps", "Long-term Holder").
        2.  An activity level classification (e.g., "Very Active", "Moderately Active", "Casual User", "Inactive").
        3.  A risk assessment:
           a. A risk score from 0 (very low risk) to 100 (very high risk).
           b. A qualitative risk level (Very Low, Low, Medium, High, Very High) that matches the score.
           c. Key factors contributing to this risk assessment (e.g., interaction with unverified contracts, large single transactions, wallet age, diversification).

        My Persona (written in the first person, as if I, the wallet persona, am speaking):
        4.  My main persona description/bio. This is where I introduce myself. It should be around 50-70 words. Example: "Hi, I'm DeFi Voyager! I'm all about exploring the latest in decentralized finance, always on the lookout for promising new projects and high-yield opportunities. I regularly engage with DEXes and lending protocols."
        5.  An engaging, very short (1-2 sentences, max 20 words) avatar bio for display directly under my avatar image. Example: "I'm DeFi Voyager! Chasing alpha and exploring new frontiers."
        6.  A cool, catchy, friendly, and representative avatar name for myself (2-3 words, e.g., 'Captain Crypto', 'Token Friend', 'Pixel Pal', 'DeFi Dreamer', 'NFT Navigator'). Make it sound approachable.

        Suggestions (objective):
        7.  Suggested tokens this wallet owner might be interested in (provide as a list of symbols).
        8.  Relevant dApps this wallet owner should explore (provide as a list of names).

        Format your response as a JSON object with these fields:
        {
          "tradingProfile": string, // Objective, third-person description
          "activityLevel": string, // Objective, third-person description
          "riskAssessment": { "level": string, "score": number, "factors": string[] }, // Objective
          "bio": string, // First person, main bio for the persona to introduce itself
          "avatarName": string, // The friendly name for the persona
          "avatarBio": string, // First person, short bio for avatar display
          "suggestedTokens": string[],
          "suggestedDapps": string[]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      try {
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonString = text.substring(startIndex, endIndex + 1);
          return JSON.parse(jsonString);
      } else {
          console.warn('Could not find valid JSON object in Gemini response for analyzeTransactions. Response text:', text);
          return this.getDefaultAnalysis(transactions, balance);
        }
      } catch (e) {
        console.error('Error parsing JSON from Gemini response for analyzeTransactions. Error:', e, 'Response text:', text);
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

    const originalPrompt = `
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

    const retryPrompt = `
        Your previous response had a JSON formatting error. Please be very careful with the JSON syntax, ensuring all strings are properly quoted, commas are correctly placed, and there are no trailing commas.
        
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

    const tryParseResponse = async (prompt: string, attempt: number): Promise<any> => {
      let textForLogging = 'Unknown response text';
      try {
        console.log(`[GeminiAIService] Generating recommendations, attempt: ${attempt}`);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
        textForLogging = text; // Assign for logging in case of parsing error
        
        console.log(`[GeminiAIService] Raw response from attempt ${attempt}:`, text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonString = text.substring(startIndex, endIndex + 1);
          return JSON.parse(jsonString);
      } else {
          console.warn(`[GeminiAIService] Could not find valid JSON object in Gemini response for generateRecommendations (attempt ${attempt}). Response text:`, text);
          return null; // Indicate failure to parse
        }
      } catch (e: any) { // Added :any to type e for accessing message property
        console.error(`[GeminiAIService] Error in tryParseResponse for generateRecommendations (attempt ${attempt}). Error: ${e.message || e}`, 'Full response text causing error:', textForLogging);
        return null; // Indicate failure to parse
      }
    };

    let recommendations = await tryParseResponse(originalPrompt, 1);

    if (!recommendations) {
      console.warn('[GeminiAIService] First attempt to generate recommendations failed or produced invalid JSON. Retrying...');
      recommendations = await tryParseResponse(retryPrompt, 2);
    }

    if (!recommendations) {
      console.error('[GeminiAIService] Both attempts to generate recommendations failed. Returning default recommendations.');
      return this.getDefaultRecommendations();
    }

    return recommendations;
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
   * Generate an avatar image prompt for the wallet owner
   */
  async generateAvatarImagePrompt(personaData: any): Promise<string> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultAvatarImagePrompt(personaData);
    }
    try {
      // Construct a detailed prompt for an image generation model
      const prompt = `
        Generate a descriptive prompt for an AI image generation model to create a **vertical (portrait-style) avatar** representing an Ethereum wallet user.
        The avatar should visually embody the following characteristics derived from their on-chain persona:

        - Primary Category: ${personaData.category || 'Unknown'}
        - Activity Level: ${personaData.activityLevel || 'Unknown'}
        - Trading Profile: ${personaData.tradingFrequency || 'Unknown'} (interpret as Low, Medium, High frequency)
        - Risk Level: ${personaData.riskAssessment?.level || 'Medium'} (e.g., Low, Medium, High)
        - Key Assets/Interests (Implied from bio & recommendations): ${personaData.bio || 'General crypto user'}
        - Avatar Name Idea: ${personaData.avatarName || 'Crypto User'}

        Describe a character or a symbolic visual. Consider elements like:
        - Character type (e.g., human, animal, robot, abstract, mythical creature). This should be a single, central figure.
        - Attire/Appearance (e.g., futuristic, casual, traditional, adorned with crypto symbols).
        - **Background: Crucially, the image should have a transparent background. If transparency is impossible, use a solid, contrasting color background (like bright green or magenta) that can be easily removed.**
        - Mood/Vibe (e.g., wise, adventurous, cautious, bold, mysterious, innovative).
        - Colors: Suggest a color palette that fits the persona for the character itself.
        - Art Style: (e.g., digital painting, cyberpunk, minimalist, vibrant illustration, 3D render, pixel art, cel-shaded).
        - **Image Composition: Full body or upper body portrait, vertical orientation (e.g., 9:16 aspect ratio).**

        The final output should be a single concise paragraph (around 60-90 words) that an image generation AI (like DALL-E, Midjourney, Stable Diffusion) can use effectively. Focus on descriptive keywords and visual elements for a **vertical portrait with a transparent or easily removable background.**
        Example: "A wise, cel-shaded owl, full body portrait, vertical orientation, with glowing blue circuit patterns on its feathers. Transparent background. Represents a long-term, tech-savvy Ethereum investor. Art style: Digital painting, cyberpunk influence."
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating avatar image prompt:', error);
      return this.getDefaultAvatarImagePrompt(personaData);
    }
  }

  private getDefaultAvatarImagePrompt(personaData: any): string {
    // Basic default prompt based on category or activity
    if (personaData.category?.includes('Active Trader')) {
      return "Dynamic, futuristic trader avatar with glowing charts in the background, cyberpunk style.";
    }
    if (personaData.category?.includes('NFT Collector')) {
      return "Artistic avatar surrounded by diverse, colorful NFT art pieces, digital collage style.";
    }
    return "General Ethereum user avatar, modern and clean design, blue and purple color scheme, digital illustration, vertical portrait, transparent background.";
  }

  async generateAvatarIntroScript(personaData: any): Promise<string> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultAvatarIntroScript(personaData);
    }
    try {
      const prompt = `
        You are an AI tasked with writing a short, engaging introductory script for a personalized Ethereum wallet avatar. The script should be in the first person, as if the avatar itself is speaking. It should be around 3-4 sentences (approx. 30-50 words) and capture the essence of the wallet's persona.

        Persona Details:
        - Avatar Name: ${personaData.avatarName || 'your digital guide'}
        - Primary Category: ${personaData.category || 'Explorer'}
        - Bio/Summary: ${personaData.bio || 'I navigate the blockchain.'}
        - Activity Level: ${personaData.activityLevel || 'Casual'}

        Instructions:
        1. Start with a greeting, using the avatar's name if appropriate.
        2. Briefly state its purpose or primary characteristic based on the persona.
        3. Add a touch of personality (e.g., wise, adventurous, analytical, artistic).
        4. Keep it concise and suitable for a voice intro.
        5. Do NOT include any financial advice or specific token endorsements beyond general terms like "DeFi" or "NFTs" if they fit the persona.

        Example Script:
        "Greetings, I am ${personaData.avatarName || 'Serenity'}. I observe the ebb and flow of the markets, seeking patterns in the digital stream. Let's explore what your on-chain story reveals."

        Generate the script:
      `;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating avatar intro script:', error);
      return this.getDefaultAvatarIntroScript(personaData);
    }
  }

  private getDefaultAvatarIntroScript(personaData: any): string {
    const name = personaData.avatarName || "your guide";
    return `Hello, I am ${name}. I'm here to help you understand your on-chain persona. Let's see what the blockchain says about you!`;
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
      avatarName: "Crypto Explorer",
      avatarBio: "Navigating the blockchain.",
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