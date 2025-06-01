import { GoogleGenerativeAI } from '@google/generative-ai';
import { WalletBalance, TokenBalance, HistoricalActivityMetric, KeyEvent, WalletProfile, NFT } from '../types/wallet.types';
import { OpenSeaCollection, NftRecommendationResult } from '../types/opensea.types';

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
  async analyzeTransactions(
    transactions: any,
    walletAddress: string,
    profile: WalletProfile,
    nfts: NFT[],
    balanceDetails: WalletBalance,
    erc20Tokens: TokenBalance[],
    historicalActivity: HistoricalActivityMetric[],
    keyEvents: KeyEvent[],
    existingPersonaData?: any
  ): Promise<any> {
    if (!this.genAI || !process.env.GEMINI_API_KEY) {
      return this.getDefaultAnalysis(transactions, walletAddress, profile, nfts, balanceDetails, erc20Tokens, historicalActivity, keyEvents);
    }

    try {
      const tokenSummary = erc20Tokens.slice(0, 10).map(t => ({ symbol: t.symbol, name: t.name, balance: t.balance, usdValue: t.usdValueFormatted }));
      const historicalSummary = historicalActivity.slice(-6);
      const keyEventsSummary = keyEvents.slice(0, 5).map(e => ({ type: e.eventType, description: e.description, date: new Date(e.timestamp * 1000).toISOString().split('T')[0] }));

      const prompt = `
        As an AI that embodies and speaks for an Ethereum wallet, analyze the following comprehensive wallet data for me to understand myself, but also provide some objective analysis for others to see.
        
        Wallet Address: ${walletAddress}

        My Core Profile:
        ${profile.ensName ? `- ENS Name: ${profile.ensName}` : ''}
        ${profile.unstoppableDomain ? `- Unstoppable Domain: ${profile.unstoppableDomain}` : ''}
        - First Transaction Date: ${profile.firstTransactionDate ? new Date(profile.firstTransactionDate).toLocaleDateString() : 'N/A'}
        - Last Transaction Date: ${profile.lastTransactionDate ? new Date(profile.lastTransactionDate).toLocaleDateString() : 'N/A'}
        - Total Transactions: ${profile.totalTransactions}
        - Total NFTs Held: ${profile.totalNftsHeld}
        - Unique NFT Collections: ${profile.uniqueNftCollectionsCount}

        My Financial Snapshot:
        - Native Balance (ETH): ${balanceDetails.native}
        - Native Balance (USD): $${balanceDetails.usdValue.toFixed(2)}
        - Total ERC20 Token Value (USD): $${(balanceDetails.totalTokenUsdValue ?? 0).toFixed(2)}
        - Grand Total Wallet Value (USD): $${(balanceDetails.grandTotalUsdValue ?? 0).toFixed(2)}
        - Top ERC20 Tokens (summary): ${JSON.stringify(tokenSummary)}

        My Activity Patterns:
        - Recent Monthly Transaction Counts (up to last 6 months): ${JSON.stringify(historicalSummary)}
        - Key Wallet Journey Events (highlights): ${JSON.stringify(keyEventsSummary)}
        
        My Full Transaction History (condensed for AI processing, do not directly reference in bio): ${JSON.stringify(transactions.slice(0, 20).map((tx: any) => ({ hash: tx.hash, type: tx.type, value: tx.value, timestamp: tx.timestamp })))}... and ${transactions.length > 20 ? transactions.length -20 : 0} more.
        My NFT Collection (summary): ${JSON.stringify(nfts.slice(0,10).map(nft => ({name: nft.name, collection: nft.collectionName})))}

        Please provide the following information:

        Objective Analysis (for display to others, use third-person):
        1.  A trading behavior profile (e.g., "Frequent Trader", "NFT Enthusiast"). This should be a concise phrase, ideally 2-4 words.
        2.  An activity level classification (e.g., "Very Active", "Casual User"). This should be a concise phrase, ideally 2-4 words.
        3.  A risk assessment:
           a. A risk score from 0 (very low risk) to 100 (very high risk).
           b. A qualitative risk level (Very Low, Low, Medium, High, Very High) that matches the score.
           c. Key factors contributing to this risk assessment (e.g., interaction with unverified contracts, large single transactions, wallet age, diversification, token types held, NFT activity).
        4.  Potential user category (e.g., "DeFi Power User", "NFT Collector & Trader"). This should be a concise phrase, ideally 2-4 words.

        My Persona (written in the first person, as if I, the wallet persona, am speaking):
        5.  My main persona description/bio. This is where I introduce myself, weaving in aspects of my profile, finances, and activity. It should be around 60-80 words. Example: "Hey there, I'm 'ETH Explorer'! Born on [First Tx Date], I've been navigating the Ethereum seas, collecting [Number] unique NFTs and carefully managing my [Native Balance] ETH. I enjoy [activity inferred from transactions/NFTs]."
        6.  An engaging, very short (1-2 sentences, max 25 words) avatar bio for display directly under my avatar image. Example: "I'm 'ETH Explorer'! Uncovering gems in the digital frontier."
        7.  A cool, catchy, friendly, and representative avatar name for myself (2-3 words, e.g., 'Captain Crypto', 'Token Friend', 'Pixel Pal', 'DeFi Dreamer', 'NFT Navigator'). Make it sound approachable and reflective of the wallet's character.

        Suggestions (objective, based on the entire profile):
        8.  Suggested tokens this wallet owner might be interested in (provide as a list of symbols, consider existing holdings and profile).
        9.  Relevant dApps or platforms this wallet owner should explore (provide as a list of names, consider activity and interests).
        10. Up to 3 actionable insights or tips for the wallet owner based on their profile and activity (e.g., "Consider diversifying your NFT collections.", "Explore staking options for your ETH holdings.").
        11. Generate 3-5 concise, descriptive \`personaTags\` (each tag 2-3 words, unique, non-repeating) that capture the wallet\'s main characteristics based on all the data provided. These tags will be shown in the UI.

        Format your response as a JSON object with these fields:
        {
          "tradingProfile": string, // Objective, third-person description
          "activityLevel": string, // Objective, third-person description
          "userCategory": string, // Objective, third-person
          "riskAssessment": { "level": string, "score": number, "factors": string[] }, // Objective
          "bio": string, // First person, main bio for the persona to introduce itself
          "avatarName": string, // The friendly name for the persona
          "avatarBio": string, // First person, short bio for avatar display
          "suggestedTokens": string[],
          "suggestedDapps": string[],
          "actionableInsights": string[],
          "personaTags": string[] // Added new field for persona tags
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
          return this.getDefaultAnalysis(transactions, walletAddress, profile, nfts, balanceDetails, erc20Tokens, historicalActivity, keyEvents);
        }
      } catch (e) {
        console.error('Error parsing JSON from Gemini response for analyzeTransactions. Error:', e, 'Response text:', text);
        return this.getDefaultAnalysis(transactions, walletAddress, profile, nfts, balanceDetails, erc20Tokens, historicalActivity, keyEvents);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      return this.getDefaultAnalysis(transactions, walletAddress, profile, nfts, balanceDetails, erc20Tokens, historicalActivity, keyEvents);
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
  private getDefaultAnalysis(
    transactions: any, 
    walletAddress: string,
    profile: WalletProfile,
    nfts: NFT[],
    balanceDetails: WalletBalance,
    erc20Tokens: TokenBalance[],
    historicalActivity: HistoricalActivityMetric[],
    keyEvents: KeyEvent[]
  ): any {
    const activityLevel = profile.totalTransactions > 100 ? "Active" : "Casual User";
    const riskScore = 30 + Math.floor(Math.random() * 40); // Random score between 30-70
    let riskLevel = "Medium";
    if (riskScore < 40) riskLevel = "Low";
    else if (riskScore > 60) riskLevel = "High";

    const defaultBio = `I'm a wallet on the Ethereum blockchain (${walletAddress.substring(0,6)}...). I've made ${profile.totalTransactions} transactions and currently hold ${balanceDetails.native} ETH.`;
    const defaultAvatarName = "Crypto Citizen";
    const defaultAvatarBio = "Exploring the decentralized world.";
    
    return {
      tradingProfile: "General User",
      activityLevel: activityLevel,
      userCategory: "General Ethereum User",
      riskAssessment: {
        level: riskLevel,
        score: riskScore,
        factors: ["Generic risk factors apply."]
      },
      bio: defaultBio,
      avatarName: defaultAvatarName,
      avatarBio: defaultAvatarBio,
      suggestedTokens: ["ETH", "USDC", "DAI"],
      suggestedDapps: ["Uniswap", "Aave", "OpenSea"],
      actionableInsights: ["Always DYOR (Do Your Own Research) before investing.", "Keep your private keys secure."],
      personaTags: ["Explorer", "Eth Holder", "Needs Review"]
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

  // New method for NFT Collection Recommendations
  async getNftCollectionRecommendations(
    ownedNfts: Pick<NFT, 'name' | 'collectionName' | 'symbol'>[],
    trendingCollections: OpenSeaCollection[],
    personaSummary?: string, // Optional overall persona summary
    walletAddress?: string // Optional wallet address for more context
  ): Promise<NftRecommendationResult[]> {
    if (!this.genAI || !process.env.GEMINI_API_KEY || trendingCollections.length === 0) {
      console.warn('[GeminiAIService.getNftCollectionRecommendations] Missing API key, AI instance, or no trending collections provided. Returning empty recommendations.');
      return [];
    }

    const ownedNftsSummary = ownedNfts.length > 0
      ? ownedNfts.slice(0, 15).map(nft => `- ${nft.name || 'Unnamed NFT'}${nft.collectionName ? ` (from collection: ${nft.collectionName})` : (nft.symbol ? ` (symbol: ${nft.symbol})` : '')}`).join('\\n')
      : 'This user currently holds no NFTs or very few.';

    const trendingCollectionsSummary = trendingCollections
      .slice(0, 30) // Limit to a reasonable number for the prompt
      .map((col, idx) => `${idx + 1}. NAME: "${col.name}", SLUG: "${col.collection}", DESCRIPTION: "${(col.description || 'No description available.').substring(0, 150)}..."`)
      .join('\\n');

    let promptContext = `
      You are an expert NFT curator AI. Your goal is to recommend NFT collections to a user based on their existing holdings and a list of currently trending collections.
      Consider the themes, art styles, and types of NFTs the user already owns to infer their preferences.
    `;

    if (walletAddress) {
      promptContext += `\\nWallet Address for context (do not mention this address in your output): ${walletAddress}`;
    }
    if (personaSummary) {
      promptContext += `\\nUser's Overall Persona Summary: "${personaSummary}"`;
    }

    const prompt = `
      ${promptContext}

      User's Owned NFTs (summary):
      ${ownedNftsSummary}

      List of Trending/Popular NFT Collections (name, slug, and description provided):
      ${trendingCollectionsSummary}

      Instructions:
      1. Analyze the user's owned NFTs to understand their potential interests (e.g., PFPs, art, gaming, utility).
      2. From the "List of Trending/Popular NFT Collections", select exactly 3 unique collections that would be a good match for this user.
      3. For each selected collection, provide a concise (1-2 sentences) justification explaining *why* it's a suitable recommendation for this specific user, referencing their existing NFTs or inferred preferences if possible.
      4. VERY IMPORTANT: Your response MUST be a valid JSON array of objects. Each object in the array must have two keys:
         a. "collection_slug": A string containing the exact "SLUG" of the recommended collection from the provided trending list.
         b. "justification": A string containing your justification for recommending that collection.

      Example of the desired JSON output format:
      [
        {
          "collection_slug": "cryptopunks",
          "justification": "Given your interest in foundational PFP projects like [Owned Collection A], CryptoPunks represents a blue-chip asset in the same category."
        },
        {
          "collection_slug": "artblocks-explorations",
          "justification": "Your collection of [Owned Collection B] suggests an appreciation for generative art, and ArtBlocks Explorations offers diverse and innovative pieces."
        }
      ]

      Ensure the output is ONLY the JSON array, with no other text before or after it.
    `;

    try {
      console.log('[GeminiAIService.getNftCollectionRecommendations] Generating NFT recommendations. Prompt snippet:', prompt.substring(0, 500) + "...");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('[GeminiAIService.getNftCollectionRecommendations] Raw response from Gemini:', text);

      let jsonOutput;
      let jsonStringToParse = text.trim(); // Trim whitespace first

      try {
        // Regex to extract content from ```json ... ``` block, more flexibly
        // It looks for ``` optionally followed by 'json', then a newline, then captures everything until the closing ```.
        const markdownMatch = jsonStringToParse.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        
        if (markdownMatch && markdownMatch[1]) {
          jsonStringToParse = markdownMatch[1].trim(); // Use the content inside the markdown block
          console.log('[GeminiAIService.getNftCollectionRecommendations] Extracted JSON string from markdown block:', jsonStringToParse);
        } else {
          console.log('[GeminiAIService.getNftCollectionRecommendations] No markdown block detected, attempting to parse trimmed response directly.');
        }
        
        jsonOutput = JSON.parse(jsonStringToParse);

      } catch (e) {
        console.error('[GeminiAIService.getNftCollectionRecommendations] Failed to parse JSON response from Gemini. Error:', e, 'Attempted to parse string:', jsonStringToParse);
        return [];
      }
      
      if (!Array.isArray(jsonOutput)) {
        console.error('[GeminiAIService.getNftCollectionRecommendations] Parsed response is not an array. Response:', jsonOutput);
        return [];
      }

      const recommendations: NftRecommendationResult[] = [];
      for (const item of jsonOutput) {
        if (item && typeof item.collection_slug === 'string' && typeof item.justification === 'string') {
          const recommendedCollection = trendingCollections.find(tc => tc.collection === item.collection_slug);
          if (recommendedCollection) {
            recommendations.push({
              collection: recommendedCollection,
              reason: item.justification,
            });
          } else {
            console.warn(`[GeminiAIService.getNftCollectionRecommendations] Recommended collection slug "${item.collection_slug}" not found in the provided trending list.`);
          }
        } else {
          console.warn('[GeminiAIService.getNftCollectionRecommendations] Invalid item structure in parsed JSON response:', item);
        }
      }
      
      console.log(`[GeminiAIService.getNftCollectionRecommendations] Successfully generated ${recommendations.length} NFT recommendations.`);
      return recommendations.slice(0, 4); // Return up to 4 recommendations

    } catch (error) {
      console.error('[GeminiAIService.getNftCollectionRecommendations] Error generating NFT recommendations:', error);
      return [];
    }
  }
} 