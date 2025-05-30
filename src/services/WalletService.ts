import Moralis from 'moralis';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import { 
  WalletDetails, 
  WalletBalance, 
  TokenBalance, 
  NFT, 
  Transaction,
  WalletProfile,
  HistoricalActivityMetric,
  KeyEvent,
  TimelineEvent,
  WalletJourneyData,
  NftTransferDetail,
  Erc20TransferDetail,
  NativeTransferDetail,
  ContractInteractionDetail,
  MoralisDefiSummaryResponse
} from '../types/wallet.types';
import { TransactionAnalyzerService, CoreTransactionAnalysis } from './TransactionAnalyzerService';

const TRANSACTION_DATA_DIR = path.join(__dirname, '..', '..', 'data', 'transactions');
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // No longer used for price fallback

export class WalletService {
  private provider: ethers.JsonRpcProvider;
  private analyzerService: TransactionAnalyzerService;

  constructor(apiKey: string, rpcUrl: string) {
    if (!Moralis.Core.isStarted) {
    Moralis.start({
      apiKey
    });
    } else {
        // Optionally, update API key if it can change, or just ensure it's set
        // Moralis.Core.config.apiKey = apiKey;
    }
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.analyzerService = new TransactionAnalyzerService();
  }

  private async _getWalletDeFiSummary(address: string, chain: string = '0x1'): Promise<MoralisDefiSummaryResponse | null> {
    try {
      console.log(`[WalletService] _getWalletDeFiSummary started for address: ${address} on chain: ${chain}`);
      const response = await Moralis.EvmApi.wallets.getDefiSummary({
        address,
        chain,
      });
      console.log(`[WalletService] _getWalletDeFiSummary Moralis response for ${address}:`, JSON.stringify(response.raw, null, 2));
      return response.raw as MoralisDefiSummaryResponse; // Assuming response.raw is the correct structure
    } catch (error: any) {
      console.error(`[WalletService] Error fetching DeFi summary for ${address} on chain ${chain}:`, error.message);
      if (error.details) {
        console.error(`[WalletService] Moralis Error Details:`, error.details);
      }
      // Do not throw, just return null so the rest of the wallet analysis can proceed
      return null; 
    }
  }

  async getWalletDetails(address: string, historicalSnapshotDate?: string): Promise<WalletDetails> {
    try {
      console.log(`[WalletService] getWalletDetails started for address: ${address}, historicalSnapshotDate: ${historicalSnapshotDate}`);
      const currentEthPrice = await this.getEthPrice(); // Get ETH price early

      const allTransactions = await this.getAllTransactions(address, '0x1');

      let snapshotEndDate: Date | undefined = undefined;
      if (historicalSnapshotDate) {
        const parsedDate = new Date(historicalSnapshotDate);
        if (!isNaN(parsedDate.getTime())) {
          snapshotEndDate = parsedDate;
          console.log(`[WalletService] Using snapshotEndDate for profile analysis: ${snapshotEndDate.toISOString()}`);
        }
      }

      const [
        nativeBalanceDetails,
        tokens,
        rawNfts,
        ensName,
        unstoppableDomain,
        walletStats,
        activeChainData,
        defiSummaryData,
        historicalActivity
      ] = await Promise.all([
        this.getNativeBalance(address),
        this.getTokenBalances(address),
        this.getNFTs(address),
        this.getEnsDomain(address),
        this.getUnstoppableDomain(address),
        this.getWalletStats(address),
        this.getActiveChains(address),
        this._getWalletDeFiSummary(address),
        this.getHistoricalActivityMetrics(address, allTransactions, currentEthPrice, 12, snapshotEndDate)
      ]);

      const totalTokenValue = tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      nativeBalanceDetails.totalTokenUsdValue = totalTokenValue;
      nativeBalanceDetails.grandTotalUsdValue = nativeBalanceDetails.usdValue + totalTokenValue;
      
      const coreAnalysis = this.analyzerService.analyzeTransactions(
        allTransactions, 
        address, 
        currentEthPrice, 
        undefined, 
        snapshotEndDate 
      );

      const profile = this.buildWalletProfile(
        address, 
        allTransactions,
        rawNfts,
        ensName, 
        unstoppableDomain, 
        walletStats, 
        activeChainData, 
        tokens,
        coreAnalysis,
        defiSummaryData
      );

      const keyEvents = this._identifyKeyEvents(allTransactions, rawNfts, profile, address);

      console.log(`[WalletService] getWalletDetails successful for address: ${address}`);
      return {
        address,
        balance: nativeBalanceDetails,
        tokens,
        nfts: rawNfts,
        transactions: allTransactions,
        profile,
        defiSummary: defiSummaryData === null ? undefined : defiSummaryData,
        historicalActivity,
        keyEvents
      };
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      throw error;
    }
  }

  private async getNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await this.provider.getBalance(address);
    const ethPrice = await this.getEthPrice();
    
    return {
      native: ethers.formatEther(balance),
      usdValue: parseFloat(ethers.formatEther(balance)) * ethPrice,
      totalTokenUsdValue: 0,
      grandTotalUsdValue: 0
    };
  }

  private async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      console.log(`[WalletService] getTokenBalances started for address: ${address}`);
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain: '0x1'
      });

      console.log(`[WalletService] getTokenBalances - Full Moralis response:`, JSON.stringify(response.raw, null, 2));

      // const result = response.result || []; // THIS LINE IS THE PROBLEM, response.result has a different structure
      // console.log(`[WalletService] getTokenBalances - Raw result array:`, JSON.stringify(result, null, 2));

      // CORRECT APPROACH: Iterate over response.raw, which is an array of token objects with the expected flat structure.
      const itemsToProcess = Array.isArray(response.raw) ? response.raw : [];
      console.log(`[WalletService] getTokenBalances - Will process ${itemsToProcess.length} token items from Moralis response.raw.`);

      const tokenBalances: TokenBalance[] = [];
      itemsToProcess.forEach((item: any, index: number) => { // Iterate over itemsToProcess (which is response.raw)
        console.log(`[WalletService] getTokenBalances - LOOP START - Processing item index: ${index}, raw item:`, JSON.stringify(item, null, 2));

        try {
          // item here is an object from response.raw, e.g.:
          // {
          //   "token_address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          //   "symbol": "WETH",
          //   "name": "Wrapped Ether",
          //   "decimals": 18,
          //   "balance": "36510000000000028",
          //   "possible_spam": false,
          //   "usd_price": 2600.50, (example, might be null)
          //   "usd_value": 94.94 (example, might be null or 0 if price is null)
          //   ...
          // }
          const tokenItem: TokenBalance = {
            contractAddress: item.token_address, 
            symbol: item.symbol,          
            name: item.name,            
            balance: item.balance,        
            decimals: item.decimals,      
            // Use item.usd_value directly if available and not spam, otherwise calculate or it will be 0
            // The Moralis getWalletTokenBalances provides `usd_value` directly if it has a price.
            usdValue: item.possible_spam ? 0 : (parseFloat(item.usd_value || '0')),
            moralisUsdPrice: item.possible_spam ? undefined : (parseFloat(item.usd_price || '0')),
            priceSource: (item.usd_price && !item.possible_spam) ? 'Moralis Wallet API' : undefined
          };

          // Spam check based on keywords
          const tokenNameLower = (tokenItem.name || '').toLowerCase();
          const tokenSymbolLower = (tokenItem.symbol || '').toLowerCase();
      const spamKeywords = [
        'reward', 'claim', 'airdrop', 'gift', '.io', '.net', '.xyz', '.site', 
              'www', '.com', 'http', '(via', 't.me'
          ];

          if (item.possible_spam) {
            console.log(`[WalletService] getTokenBalances - Skipping token ${tokenItem.name} (${tokenItem.symbol}) due to Moralis possible_spam flag.`);
            return;
          }

          if (!tokenSymbolLower || tokenSymbolLower.length > 10 || tokenSymbolLower.length < 2) {
            console.log(`[WalletService] getTokenBalances - Skipping token ${tokenItem.name} (${tokenItem.symbol}) due to symbol length.`);
            return;
          }
          if (tokenNameLower.includes('http')) {
            console.log(`[WalletService] getTokenBalances - Skipping token ${tokenItem.name} (${tokenItem.symbol}) due to 'http' in name.`);
            return;
          }
          for (const keyword of spamKeywords) {
            if (tokenNameLower.includes(keyword) || tokenSymbolLower.includes(keyword)) {
              console.log(`[WalletService] getTokenBalances - Skipping token ${tokenItem.name} (${tokenItem.symbol}) due to spam keyword '${keyword}'.`);
              return;
            }
          }

          tokenBalances.push(tokenItem);

        } catch (e) {
          console.error(`[WalletService] getTokenBalances - FAILED to process token item at index ${index}:`, item, `Error:`, e);
        }
      });

      console.log(`[WalletService] getTokenBalances - Loop finished. Number of successfully mapped tokenBalances (before price fallback): ${tokenBalances.length}.`);

      // Post-process to fetch prices if Moralis price is missing or zero
      const processedTokens: TokenBalance[] = await Promise.all(tokenBalances.map(async (tokenItem) => {
        if ((!tokenItem.usdValue || tokenItem.usdValue === 0) && parseFloat(tokenItem.balance) > 0 && tokenItem.contractAddress) {
          console.log(`[WalletService] Moralis getWalletTokenBalances price for ${tokenItem.name} (${tokenItem.symbol}) is 0 or missing. Attempting Moralis getTokenPrice fallback.`);
          const priceData = await this._fetchMissingTokenPriceWithMoralis(tokenItem.contractAddress);
          if (priceData && priceData.usdValue > 0 && tokenItem.decimals !== undefined) {
            const balanceNum = parseFloat(ethers.formatUnits(tokenItem.balance, tokenItem.decimals));
            tokenItem.usdValue = balanceNum * priceData.usdValue;
            tokenItem.priceSource = 'Moralis Price API Fallback';
            (tokenItem as any).perTokenUsdPriceFromFallback = priceData.usdValue;
             console.log(`[WalletService] Fallback successful for ${tokenItem.name}. New USD value: ${tokenItem.usdValue}, Per token price: ${priceData.usdValue}`);
          } else {
            tokenItem.priceSource = 'Not Found';
            console.log(`[WalletService] Fallback price not found or invalid for ${tokenItem.name} (${tokenItem.symbol}). USD value remains 0.`);
          }
        } else if (tokenItem.usdValue > 0 && !tokenItem.priceSource) {
            tokenItem.priceSource = 'Moralis Wallet API';
        } else if (!tokenItem.priceSource) {
            tokenItem.priceSource = 'Not Found';
        }

        // Format USD value after all price fetching logic
        tokenItem.usdValueFormatted = `$${tokenItem.usdValue.toFixed(2)}`;

        return tokenItem;
      }));

      console.log(`[WalletService] getTokenBalances - All fallback price promises resolved. Final tokenBalances count: ${processedTokens.length}`);
      processedTokens.forEach(tb => {
        // Added safety for logging, in case tb or tb.symbol is undefined after a bad processing
        const symbol = tb && tb.symbol ? tb.symbol : 'UNKNOWN_SYMBOL';
        const balance = tb ? tb.balance : 'N/A';
        const usdValueFormatted = tb ? tb.usdValueFormatted : 'N/A';
        const priceSource = tb ? tb.priceSource : 'N/A';
        const perTokenFallback = tb ? (tb as any).perTokenUsdPriceFromFallback : 'N/A';
        console.log(`[WalletService] getTokenBalances - FINAL: ${symbol}, Balance: ${balance}, USD Value: ${usdValueFormatted}, Source: ${priceSource}, PerTokenFallback: ${perTokenFallback}`);
      });

      return processedTokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  private async getNFTs(address: string): Promise<NFT[]> {
    try {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain: "0x1",
      });
      // console.log(`[WalletService] getNFTs - Moralis SDK response for ${address} (raw):`, JSON.stringify(response.raw, null, 2));

      const result = response.result || [];
      // console.log(`[WalletService] getNFTs - RAW NFT OBJECT FROM MORALIS SDK (sample first one for ${address}):`, result.length > 0 ? JSON.stringify(result[0].raw, null, 2) : "No NFTs found");


      return result.map((nftFromApi: any): NFT => {
        // console.log(`[WalletService] Processing NFT: ${nftFromApi?.tokenAddress?.toString()}/${nftFromApi?.tokenId?.toString()}`);
        let imageUrl: string | undefined = undefined;
        let metadataToParse: any = null;
        let collectionName: string | undefined = nftFromApi.name; // Initial attempt from Moralis's top-level name for the NFT
        let collectionLogo: string | undefined = nftFromApi.collectionLogo || nftFromApi.collection_logo;


        // 1. Prioritize normalizedMetadata (camelCase)
        if (nftFromApi.normalizedMetadata && typeof nftFromApi.normalizedMetadata === 'object') {
          metadataToParse = nftFromApi.normalizedMetadata;
        } 
        // Fallback for snake_case normalized_metadata
        else if (nftFromApi.normalized_metadata && typeof nftFromApi.normalized_metadata === 'object') {
            metadataToParse = nftFromApi.normalized_metadata;
        }
        // 2. Fallback for metadata as an object (camelCase)
        else if (nftFromApi.metadata && typeof nftFromApi.metadata === 'object') {
            metadataToParse = nftFromApi.metadata;
        }
        // 3. Fallback for metadata as a JSON string
        else if (nftFromApi.metadata && typeof nftFromApi.metadata === 'string') {
          try {
            metadataToParse = JSON.parse(nftFromApi.metadata);
          } catch (e) {
            // console.warn(`[WalletService] Failed to parse NFT metadata string for ${nftFromApi?.tokenAddress?.toString()}/${nftFromApi?.tokenId?.toString()}`);
          }
        }

        if (metadataToParse) {
          if (metadataToParse.image) imageUrl = metadataToParse.image;
          else if (metadataToParse.image_url) imageUrl = metadataToParse.image_url;

          if (!collectionName && (metadataToParse.collection?.name || metadataToParse.collection_name)) {
            collectionName = metadataToParse.collection.name || metadataToParse.collection_name;
          }
          if (!collectionName && metadataToParse.name && nftFromApi.tokenType === 'ERC1155') { // For ERC1155, the NFT's name might be the collection's name
             // Heuristic: if nft name resembles a collection name and symbol is present
             if(nftFromApi.symbol && metadataToParse.name !== nftFromApi.symbol + " #" + nftFromApi.tokenId) {
                collectionName = metadataToParse.name;
             }
          }


          if (!collectionLogo && (metadataToParse.collection?.image_url || metadataToParse.collection?.image || metadataToParse.collection_logo)) {
            collectionLogo = metadataToParse.collection.image_url || metadataToParse.collection.image || metadataToParse.collection_logo;
          }
        }
        
        // 4. Fallback to tokenUri if it's a data URI containing JSON
        if (!imageUrl && nftFromApi.tokenUri && nftFromApi.tokenUri.startsWith('data:application/json;base64,')) {
          try {
            const base64String = nftFromApi.tokenUri.split(',')[1];
            const decodedJson = Buffer.from(base64String, 'base64').toString('utf-8');
            const jsonData = JSON.parse(decodedJson);
            if (jsonData.image) imageUrl = jsonData.image;
            else if (jsonData.image_url) imageUrl = jsonData.image_url;
          } catch (e) {
            // console.warn(`[WalletService] Failed to parse base64 token URI for ${nftFromApi?.tokenAddress?.toString()}/${nftFromApi?.tokenId?.toString()}`);
          }
        }
        
        // 5. Fallback to media items
        if (!imageUrl && nftFromApi.media?.items && Array.isArray(nftFromApi.media.items) && nftFromApi.media.items.length > 0) {
            const imageMediaItem = nftFromApi.media.items.find((item: any) => item.url && (item.mimetype?.startsWith('image') || item.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)));
            if (imageMediaItem) imageUrl = imageMediaItem.url;
        } else if (!imageUrl && nftFromApi.mediaItems && Array.isArray(nftFromApi.mediaItems) && nftFromApi.mediaItems.length > 0) { // Alternative structure name
            const imageMediaItem = nftFromApi.mediaItems.find((item: any) => item.url && (item.type === 'image' || item.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)));
            if (imageMediaItem) imageUrl = imageMediaItem.url;
        }

        // 6. IPFS URL conversion for image and logo
        if (imageUrl && imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        if (collectionLogo && collectionLogo.startsWith('ipfs://')) {
          collectionLogo = collectionLogo.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        let finalContractAddress = '';
        const rawTokenAddress = nftFromApi.tokenAddress || nftFromApi.token_address;
        if (typeof rawTokenAddress === 'string') {
          finalContractAddress = rawTokenAddress;
        } else if (rawTokenAddress && typeof rawTokenAddress.checksum === 'string') {
          finalContractAddress = rawTokenAddress.checksum;
        }
        
        const nftName = metadataToParse?.name || nftFromApi.name || '';

        // If collectionName is still not found, try to use the NFT's own name if it seems generic enough, or symbol
        if (!collectionName) {
            collectionName = nftFromApi.name || nftFromApi.symbol || 'Unknown Collection';
        }


        return {
          tokenId: nftFromApi.tokenId?.toString() || nftFromApi.token_id?.toString() || '',
          contractAddress: finalContractAddress.toLowerCase(), // Standardize to lowercase
          name: nftName,
          symbol: nftFromApi.symbol || '',
          imageUrl: imageUrl,
          collectionName: collectionName,
          collectionLogo: collectionLogo,
        };
      });
    } catch (error) {
      console.error(`[WalletService] Error fetching or processing NFTs for ${address}:`, error);
      return [];
    }
  }

  private _analyzeNftHoldings(nfts: NFT[]): Pick<WalletProfile, 'totalNftsHeld' | 'uniqueNftCollectionsCount' | 'topNftCollections'> {
    if (!nfts || nfts.length === 0) {
        return { totalNftsHeld: 0, uniqueNftCollectionsCount: 0, topNftCollections: [] };
    }

    const collectionsMap: Map<string, { name?: string; symbol?: string; logo?: string; nfts: NFT[] }> = new Map();

    nfts.forEach(nft => {
        if (!nft.contractAddress) return; 

        if (!collectionsMap.has(nft.contractAddress)) {
            collectionsMap.set(nft.contractAddress, {
                name: nft.collectionName || nft.symbol || 'Unknown Collection', 
                symbol: nft.symbol,
                logo: nft.collectionLogo,
                nfts: []
            });
        }
        const collection = collectionsMap.get(nft.contractAddress);
        if (collection) {
          collection.nfts.push(nft);
          if (!collection.name && nft.collectionName) collection.name = nft.collectionName;
          else if (collection.name === 'Unknown Collection' && nft.collectionName) collection.name = nft.collectionName; 
          if (!collection.logo && nft.collectionLogo) collection.logo = nft.collectionLogo;
          if (!collection.symbol && nft.symbol) collection.symbol = nft.symbol;
        }
    });

    const topCollectionsData = Array.from(collectionsMap.entries())
        .map(([address, data]) => ({
            contractAddress: address,
            name: data.name || 'Unknown Collection',
            symbol: data.symbol || 'N/A',
            collectionLogo: data.logo,
            count: data.nfts.length,
            nfts: data.nfts.slice(0, 3) // Sample up to 3 NFTs
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 collections

    return {
        totalNftsHeld: nfts.length,
        uniqueNftCollectionsCount: collectionsMap.size,
        topNftCollections: topCollectionsData
    };
  }

  private async getAllTransactions(address: string, chain: string): Promise<Transaction[]> {
    await this._ensureTransactionDataDirExists();

    // Try to load from local cache first
    const cachedTransactions = await this._loadTransactionsFromFile(address);
    if (cachedTransactions) {
      // Optional: Add logic here to check if cached data is recent enough or complete enough.
      // For now, if it exists, we use it.
      console.log(`[WalletService] Using cached transactions for ${address}. Count: ${cachedTransactions.length}`);
      // We need to sort here too, as buildWalletProfile expects sorted transactions
      cachedTransactions.sort((a, b) => {
        if (a.timestamp === 0 && b.timestamp === 0) return 0;
        if (a.timestamp === 0) return 1;
        if (b.timestamp === 0) return -1;
        return a.timestamp - b.timestamp;
      });
      return cachedTransactions;
    }

    let allTransactions: Transaction[] = [];
    let currentCursor: string | undefined = undefined;
    let pageNumber = 0;
    const MAX_PAGES = 100; // Safety break for very large wallets to avoid infinite loops / excessive calls during dev

    console.log(`[WalletService] getAllTransactions started for address: ${address} on chain: ${chain}`);

    try {
      do {
        pageNumber++;
        console.log(`[WalletService] getAllTransactions - Fetching page ${pageNumber} for ${address}, cursor: ${currentCursor}`);
        const { transactions: pageTransactions, nextCursor } = await this._fetchTransactionPage(address, chain, currentCursor);

        if (pageTransactions.length === 0) {
          console.log(`[WalletService] getAllTransactions - No transactions returned for page ${pageNumber}, stopping.`);
          break; // No more transactions
        }

        allTransactions = allTransactions.concat(pageTransactions);
        currentCursor = nextCursor;

        console.log(`[WalletService] getAllTransactions - Fetched ${pageTransactions.length} transactions. Total so far: ${allTransactions.length}. Next cursor: ${currentCursor}`);
        
        // Optional: Add a small delay if hitting rate limits, though Moralis SDK might handle some retry logic.
        // await new Promise(resolve => setTimeout(resolve, 250)); 

      } while (currentCursor && pageNumber < MAX_PAGES);

      if (pageNumber >= MAX_PAGES && currentCursor) {
        console.warn(`[WalletService] getAllTransactions - Reached MAX_PAGES limit (${MAX_PAGES}) for ${address}. Transaction history might be incomplete.`);
      }

    } catch (error) {
      console.error(`[WalletService] Error in getAllTransactions pagination loop for ${address}:`, error);
      // Return whatever was fetched so far, or handle error more gracefully
    }
    
    // Log how many timestamps are zero BEFORE sorting
    const zeroTimestampCount = allTransactions.filter(t => t.timestamp === 0).length;
    if (zeroTimestampCount > 0) {
      console.warn(`[WalletService] getAllTransactions - ${zeroTimestampCount} out of ${allTransactions.length} transactions have a parsed timestamp of 0 (epoch).`);
      if (zeroTimestampCount === allTransactions.length && allTransactions.length > 0) {
        console.error(`[WalletService] getAllTransactions - CRITICAL: All ${allTransactions.length} fetched transactions have a timestamp of 0. Check parsing logic and Moralis response for 'block_timestamp'.`);
      }
    }

    // Sort transactions: oldest first for easier first/last determination
    allTransactions.sort((a, b) => {
      if (a.timestamp === 0 && b.timestamp === 0) return 0; // Keep order for multiple 0s if any
      if (a.timestamp === 0) return 1; // Push 0 timestamps to the end after valid ones
      if (b.timestamp === 0) return -1; // Keep valid b timestamps before 0 a timestamps
      return a.timestamp - b.timestamp;
    });

    console.log(`[WalletService] getAllTransactions completed for address: ${address}. Total transactions fetched: ${allTransactions.length}.`);
    if (allTransactions.length > 0) {
      const firstValidTx = allTransactions.find(tx => tx.timestamp > 0);
      const lastValidTx = [...allTransactions].reverse().find(tx => tx.timestamp > 0);
      const firstTsLog = firstValidTx ? new Date(firstValidTx.timestamp * 1000).toISOString() : 'N/A (all zero or empty)';
      const lastTsLog = lastValidTx ? new Date(lastValidTx.timestamp * 1000).toISOString() : 'N/A (all zero or empty)';
      console.log(`[WalletService] getAllTransactions - Effective First Timestamp (non-zero): ${firstTsLog}, Effective Last Timestamp (non-zero): ${lastTsLog}`);
    }

    await this._saveTransactionsToFile(address, allTransactions);

    return allTransactions;
  }

  // Renamed from getRawTransactions and made private for pagination
  private async _fetchTransactionPage(address: string, chain: string, cursor?: string): Promise<{ transactions: Transaction[], nextCursor?: string }> {
    try {
      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain,
        cursor, // Add cursor for pagination
        limit: 100 // Sensible limit per page
      });
      console.log(`[WalletService] _fetchTransactionPage Moralis response for ${address}, cursor: ${cursor}:`, JSON.stringify(response.raw, null, 2).substring(0, 500) + "..."); // Log snippet

      const result = response.result || [];
      const transactions = result.map((tx: any, index: number) => {
        let potentialTimestampString: string | undefined = undefined;

        // Attempt 1: Direct camelCase access on the instance (e.g., tx.blockTimestamp)
        if (tx.blockTimestamp && typeof tx.blockTimestamp === 'string') {
            potentialTimestampString = tx.blockTimestamp;
        }
        // Attempt 2: Via toJSON() then snake_case (e.g., tx.toJSON().block_timestamp)
        else if (typeof tx.toJSON === 'function') {
            const txJSON = tx.toJSON();
            if (txJSON && txJSON.block_timestamp && typeof txJSON.block_timestamp === 'string') {
                potentialTimestampString = txJSON.block_timestamp;
            }
            // Attempt 3: Via toJSON() then camelCase (e.g., tx.toJSON().blockTimestamp)
            else if (txJSON && txJSON.blockTimestamp && typeof txJSON.blockTimestamp === 'string') {
                potentialTimestampString = txJSON.blockTimestamp;
            }
        }
        // Attempt 4: Direct snake_case access on the instance (e.g., tx.block_timestamp) - often undefined if getters are used
        else if (tx.block_timestamp && typeof tx.block_timestamp === 'string') {
            potentialTimestampString = tx.block_timestamp;
        }

        let parsedTs = 0;
        if (potentialTimestampString) {
          const dateObj = new Date(potentialTimestampString);
          if (!isNaN(dateObj.getTime())) {
            parsedTs = dateObj.getTime() / 1000; // Convert ms to seconds
          } else {
            console.warn(`[WalletService] _fetchTransactionPage - Invalid date format from potential timestamp: "${potentialTimestampString}" for tx: ${tx.hash}`);
          }
        } else {
            console.warn(`[WalletService] _fetchTransactionPage - Timestamp NOT found for ${tx.hash} after all attempts.`);
        }
        
        return {
        hash: tx.hash || '',
          from: tx.from_address?.toString() || '', 
          to: tx.to_address?.toString() || '',     
        value: tx.value?.toString() || '0',
          timestamp: parsedTs,
          type: tx.from_address?.toString().toLowerCase() === address.toLowerCase() ? 'outgoing' as const : 'incoming' as const,
          raw: tx 
        };
      });
      
      const nextCursor = response.raw.cursor; 
      console.log(`[WalletService] _fetchTransactionPage processed ${transactions.length} transactions for ${address}. Next cursor: ${nextCursor}`);
      return { transactions, nextCursor };
    } catch (error) {
      console.error(`[WalletService] Error fetching a page of transactions for ${address}:`, error);
      return { transactions: [], nextCursor: undefined }; // Return empty and no cursor on error
    }
  }

  private buildWalletProfile(
    address: string,
    transactions: Transaction[],
    rawNfts: NFT[],
    ensName: string | undefined,
    unstoppableDomain: string | undefined,
    walletStats: any, 
    activeChainData: any, 
    tokens: TokenBalance[],
    coreAnalysis: CoreTransactionAnalysis,
    defiSummary: MoralisDefiSummaryResponse | null
  ): WalletProfile {
    console.log(`[WalletService] buildWalletProfile called for address: ${address}`);
    console.log(`[WalletService] buildWalletProfile - TOTAL transactions from getAllTransactions: ${transactions.length}`);
    console.log(`[WalletService] buildWalletProfile - ensName: ${ensName}`);
    console.log(`[WalletService] buildWalletProfile - unstoppableDomain: ${unstoppableDomain}`);
    // walletStats and activeChainData might still be useful for other things, but not for first/last tx date or total tx count.
    console.log(`[WalletService] buildWalletProfile - walletStats input (for reference):`, JSON.stringify(walletStats, null, 2));
    console.log(`[WalletService] buildWalletProfile - activeChainData input (for reference):`, JSON.stringify(activeChainData, null, 2));
    console.log(`[WalletService] buildWalletProfile - tokens count (for uniqueTokenCount): ${tokens.length}`);
    console.log(`[WalletService] buildWalletProfile - rawNfts count: ${rawNfts.length}`);

    let firstTransactionDate: Date | undefined;
    let lastTransactionDate: Date | undefined;
    const now = new Date(); // For safety capping if needed, though direct data is better

    if (transactions.length > 0) {
      // Find min and max valid timestamps, ignoring 0s
      let minTimestamp = Infinity;
      let maxTimestamp = 0; // Will store valid positive timestamps

      transactions.forEach(tx => {
        if (tx.timestamp && tx.timestamp > 0) { // Check if timestamp is defined and valid (non-zero)
          if (tx.timestamp < minTimestamp) {
            minTimestamp = tx.timestamp;
          }
          if (tx.timestamp > maxTimestamp) {
            maxTimestamp = tx.timestamp;
          }
        }
      });

      if (minTimestamp !== Infinity && minTimestamp > 0) {
        firstTransactionDate = new Date(minTimestamp * 1000);
        // Safety check for future dates - unlikely if data is from blockchain
        if (firstTransactionDate > now) {
            console.warn(`[WalletService] buildWalletProfile - Derived firstTransactionDate ${firstTransactionDate.toISOString()} is in the future. Capping to now.`);
            firstTransactionDate = now;
        }
      } else {
        console.warn(`[WalletService] buildWalletProfile - No valid first transaction date (minTimestamp) found for ${address}.`);
      }

      if (maxTimestamp > 0) {
        lastTransactionDate = new Date(maxTimestamp * 1000);
        // Safety check for future dates
        if (lastTransactionDate > now) {
            console.warn(`[WalletService] buildWalletProfile - Derived lastTransactionDate ${lastTransactionDate.toISOString()} is in the future. Capping to now.`);
            lastTransactionDate = now;
        }
      } else {
        console.warn(`[WalletService] buildWalletProfile - No valid last transaction date (maxTimestamp) found for ${address}.`);
      }
      
      console.log(`[WalletService] buildWalletProfile - Derived firstTransactionDate from valid transactions: ${firstTransactionDate ? firstTransactionDate.toISOString() : 'N/A'}`);
      console.log(`[WalletService] buildWalletProfile - Derived lastTransactionDate from valid transactions: ${lastTransactionDate ? lastTransactionDate.toISOString() : 'N/A'}`);
    } else {
      console.log(`[WalletService] buildWalletProfile - No transactions found for ${address}. Dates will be undefined.`);
    }
    
    const totalTransactions = transactions.length;
    console.log(`[WalletService] buildWalletProfile - Derived totalTransactions from all transactions: ${totalTransactions}`);
    
    // Keep existing logic for totalReceived, totalSent, uniqueTokenCount, activeChainsSummary
    // activeChainsSummary can still be derived from activeChainData if needed, or from transaction data if more detailed chain info is desired.
    // For now, let's keep activeChainsSummary from activeChainData as it was.
    let chainListToUse: any[] = [];
    if (activeChainData) {
      if (typeof activeChainData.toJSON === 'function') {
        const jsonData = activeChainData.toJSON();
        chainListToUse = jsonData.active_chains || [];
      } else if (Array.isArray(activeChainData.active_chains)) {
        chainListToUse = activeChainData.active_chains;
      }
    }
    const activeChainsSummary = (chainListToUse || []).map(
        (chain: any) => chain.chain || chain.chain_id 
      ).slice(0, 3);
    console.log(`[WalletService] buildWalletProfile - activeChainsSummary (from activeChainData):`, activeChainsSummary);

    const totalReceived = transactions
      .filter(tx => tx.type === 'incoming')
      .reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.value || '0')), 0);
    const totalSent = transactions
      .filter(tx => tx.type === 'outgoing')
      .reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.value || '0')), 0);

    const uniqueTokenCount = tokens.length; // Assumes tokens are already filtered for spam and unique by symbol/address

    const nftAnalysisResults = this._analyzeNftHoldings(rawNfts);
    // console.log(`[WalletService] NFT Analysis for ${address}:`, nftAnalysisResults);

    const analysis = coreAnalysis as CoreTransactionAnalysis;
    const profile: WalletProfile = {
      address,
      ensName,
      unstoppableDomain,
      firstTransactionDate,
      lastTransactionDate,
      totalTransactions,
      totalValueReceived: totalReceived,
      totalValueSent: totalSent,
      activeChains: activeChainsSummary,
      uniqueTokenCount,
      averageGasPriceGwei: analysis.averageGasPriceGwei,
      mostExpensiveTxHash: analysis.mostExpensiveTxHash,
      mostExpensiveTxFeeEth: analysis.mostExpensiveTxFeeEth,
      mostExpensiveTxFeeUsd: analysis.mostExpensiveTxFeeUsd,
      ...nftAnalysisResults, // Spread NFT analysis results here
      ...analysis, 
      defiSummary: defiSummary === null ? undefined : defiSummary,
      daoGovernanceTokensHeld: [], // Placeholder, to be implemented
      daoVotingActivity: undefined // Placeholder, to be implemented
    };

    console.log(`[WalletService] buildWalletProfile - returning profile (with DeFi summary):`, JSON.stringify(profile, null, 2));
    return profile;
  }

  private async getEnsDomain(address: string): Promise<string | undefined> {
    try {
      // Moralis.EvmApi.resolve.resolveAddress takes address and returns .result.name
      // Based on Moralis.md: No. 23 resolveAddress	ENS Lookup by Address
      const response = await Moralis.EvmApi.resolve.resolveAddress({ address });
      return response?.result?.name || undefined;
    } catch (error) {
      console.warn(`ENS lookup failed for ${address}:`, error);
      return undefined;
    }
  }

  private async getUnstoppableDomain(address: string): Promise<string | undefined> {
    try {
      // Moralis.EvmApi.resolve.resolveAddressToDomain
      // Based on Moralis.md: No. 25 resolveAddressToDomain	Unstoppable Lookup by Address
       console.log(`[WalletService] getUnstoppableDomain called for address: ${address}`);
       const response = await Moralis.EvmApi.resolve.resolveAddressToDomain({ address });
       console.log(`[WalletService] getUnstoppableDomain Moralis response for ${address}:`, JSON.stringify(response.raw, null, 2));
      return response?.result?.name || undefined;
    } catch (error) {
      console.warn(`[WalletService] Unstoppable Domain lookup failed for ${address}:`, error);
      return undefined;
    }
  }

  private async getWalletStats(address: string): Promise<any> { // Replace 'any' with a proper type
    try {
      // Based on Moralis.md: No. 22 getWalletStats
      console.log(`[WalletService] getWalletStats called for address: ${address}`);
      const response = await Moralis.EvmApi.wallets.getWalletStats({ address, chain: '0x1' }); // Assuming chain '0x1' (Ethereum)
      console.log(`[WalletService] getWalletStats Moralis response for ${address}:`, JSON.stringify(response.raw, null, 2));
      return response?.result || {};
    } catch (error) {
      console.warn(`[WalletService] Failed to get wallet stats for ${address}:`, error);
      return {};
    }
  }

  private async getActiveChains(address: string): Promise<any> { // Replace 'any' with a proper type
    try {
      // Based on Moralis.md: No. 21 getWalletActiveChains
      console.log(`[WalletService] getActiveChains called for address: ${address}`);
      const response = await Moralis.EvmApi.wallets.getWalletActiveChains({ address });
      console.log(`[WalletService] getActiveChains Moralis response for ${address}:`, JSON.stringify(response.raw, null, 2));
      // Ensure fallback provides an object with an active_chains property
      return response?.result || { active_chains: [] };
    } catch (error) {
      console.warn(`[WalletService] Failed to get active chains for ${address}:`, error);
      return { active_chains: [] }; // Ensure fallback provides an object with an active_chains property
    }
  }

  private async getEthPrice(): Promise<number> {
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH contract
        chain: '0x1'
      });
      return response.result?.usdPrice || 2000;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 2000; // Fallback price
    }
  }

  private async _ensureTransactionDataDirExists(): Promise<void> {
    try {
      await fs.access(TRANSACTION_DATA_DIR);
    } catch (error) {
      // Directory does not exist, or other error
      try {
        await fs.mkdir(TRANSACTION_DATA_DIR, { recursive: true });
        console.log(`[WalletService] Created transaction data directory: ${TRANSACTION_DATA_DIR}`);
      } catch (mkdirError) {
        console.error(`[WalletService] Error creating transaction data directory ${TRANSACTION_DATA_DIR}:`, mkdirError);
        throw mkdirError; // Rethrow if critical
      }
    }
  }

  private _getTransactionsFilePath(address: string): string {
    return path.join(TRANSACTION_DATA_DIR, `${address.toLowerCase()}.json`);
  }

  private async _saveTransactionsToFile(address: string, transactions: Transaction[]): Promise<void> {
    const filePath = this._getTransactionsFilePath(address);
    try {
      await this._ensureTransactionDataDirExists(); // Ensure directory exists before writing
      await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
      console.log(`[WalletService] Transactions for ${address} saved to ${filePath}`);
    } catch (error) {
      console.error(`[WalletService] Error saving transactions for ${address} to ${filePath}:`, error);
      // Decide if this error should be re-thrown or handled gracefully
    }
  }

  private async _loadTransactionsFromFile(address: string): Promise<Transaction[] | null> {
    const filePath = this._getTransactionsFilePath(address);
    try {
      await fs.access(filePath); // Check if file exists
      const data = await fs.readFile(filePath, 'utf-8');
      const transactions = JSON.parse(data) as Transaction[];
      console.log(`[WalletService] Transactions for ${address} loaded from ${filePath}`);
      return transactions;
    } catch (error) {
      // If file doesn't exist (ENOENT), it's not an error, just no cache.
      // Other errors (like JSON parsing) should be logged.
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        console.warn(`[WalletService] Error loading transactions for ${address} from ${filePath}:`, error);
      } else {
        console.log(`[WalletService] No local transaction file found for ${address} at ${filePath}. Fetching from API.`);
      }
      return null;
    }
  }

  // Method to identify key events for the wallet journey timeline
  private _identifyKeyEvents(
    transactions: Transaction[],
    nfts: NFT[],
    profile: WalletProfile,
    walletAddress: string
  ): KeyEvent[] {
    const keyEvents: KeyEvent[] = [];
    if (!transactions || transactions.length === 0) {
      return keyEvents;
    }

    const lowerCaseWalletAddress = walletAddress.toLowerCase();

    // 1. First Transaction
    if (profile.firstTransactionDate && transactions.length > 0) {
      // Assuming transactions are sorted by timestamp ASC
      const firstTx = transactions.find(tx => tx.timestamp && tx.timestamp > 0);
      if (firstTx) {
        keyEvents.push({
          timestamp: firstTx.timestamp,
          eventType: "First Transaction",
          description: `Wallet's first recorded transaction.`, 
          transactionHash: firstTx.hash,
        });
      }
    }

    // 2. Most Expensive Gas Fee Transaction
    if (profile.mostExpensiveTxHash && profile.mostExpensiveTxFeeEth) {
      const expensiveTx = transactions.find(tx => tx.hash === profile.mostExpensiveTxHash);
      if (expensiveTx) {
        keyEvents.push({
          timestamp: expensiveTx.timestamp,
          eventType: "High Gas Fee",
          description: `Paid ${profile.mostExpensiveTxFeeEth.toFixed(4)} ETH in gas, one of the highest fees for this wallet.`, 
          transactionHash: profile.mostExpensiveTxHash,
        });
      }
    }

    // 3. Significant ETH Transfers (e.g., top 3 outgoing by value)
    const outgoingEthTransfers = transactions
      .filter(tx => 
        tx.type === 'outgoing' && 
        tx.value && 
        parseFloat(ethers.formatEther(tx.value)) > 0.01 // Basic threshold to avoid dust
      )
      .sort((a, b) => parseFloat(ethers.formatEther(b.value || '0')) - parseFloat(ethers.formatEther(a.value || '0')));
    
    outgoingEthTransfers.slice(0, 3).forEach(tx => {
      const ethValue = parseFloat(ethers.formatEther(tx.value || '0'));
      keyEvents.push({
        timestamp: tx.timestamp,
        eventType: "Significant ETH Transfer Out",
        description: `Sent ${ethValue.toFixed(4)} ETH to ${tx.to.substring(0,6)}...${tx.to.substring(tx.to.length-4)}.`, 
        transactionHash: tx.hash,
        value: ethValue.toFixed(4) + " ETH",
        relatedAddress: tx.to
      });
    });

    // 4. Contract Deployments
    transactions.forEach(tx => {
      if (tx.raw?.to === null || tx.raw?.to === '' || tx.raw?.to === '0x0000000000000000000000000000000000000000') {
        if (tx.raw?.receiptContractAddress) {
          keyEvents.push({
            timestamp: tx.timestamp,
            eventType: "Contract Deployment",
            description: `Deployed a new contract: ${tx.raw.receiptContractAddress.substring(0,8)}...`, 
            transactionHash: tx.hash,
            relatedAddress: tx.raw.receiptContractAddress
          });
        }
      }
    });

    // 5. NFT Interactions (heuristic: interaction with known NFT contract addresses)
    const nftContractAddresses = new Set(nfts.map(nft => nft.contractAddress.toLowerCase()));
    const nftInteractionEvents: KeyEvent[] = [];
    transactions.forEach(tx => {
      const toAddress = tx.to?.toLowerCase();
      const fromAddress = tx.from?.toLowerCase();
      let interactionType = "";
      let nftContract = "";

      if (toAddress && nftContractAddresses.has(toAddress)) {
        interactionType = tx.type === 'outgoing' ? "NFT Interaction (likely Mint/Buy)" : "NFT Interaction (likely Transfer In/Sale)";
        nftContract = toAddress;
      } else if (fromAddress && nftContractAddresses.has(fromAddress) && tx.type === 'incoming') {
        // This might be less common unless it's a return from a contract, but good to cover.
        interactionType = "NFT Interaction (from Collection)";
        nftContract = fromAddress;
      }

      if (interactionType) {
        const nftInfo = nfts.find(n => n.contractAddress.toLowerCase() === nftContract);
        const collectionName = nftInfo?.collectionName || nftInfo?.name || nftContract.substring(0,8)+"...";
        // Avoid duplicate event types for the same hash if already added by other logic
        if (!keyEvents.find(e => e.transactionHash === tx.hash && e.eventType.startsWith("NFT"))) {
            nftInteractionEvents.push({
                timestamp: tx.timestamp,
                eventType: interactionType,
                description: `Interacted with NFT Collection: ${collectionName}.`, 
                transactionHash: tx.hash,
                relatedAddress: nftContract
            });
        }
      }
    });
    keyEvents.push(...nftInteractionEvents.slice(0, 5)); // Limit NFT events to avoid clutter
    
    // Sort all events by timestamp (ascending)
    keyEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Deduplicate events: if multiple events have the exact same timestamp and type, keep one.
    // This is a simple deduplication. More complex logic might be needed if descriptions vary meaningfully.
    const uniqueKeyEvents = keyEvents.filter((event, index, self) =>
      index === self.findIndex(e => 
        e.timestamp === event.timestamp && 
        e.eventType === event.eventType &&
        e.transactionHash === event.transactionHash // Ensure hash match for true uniqueness
      )
    );
    
    // Limit total number of events to avoid overwhelming the timeline
    const MAX_KEY_EVENTS = 15;
    if (uniqueKeyEvents.length > MAX_KEY_EVENTS) {
        // Prioritize: first tx, major transfers, deployments, then others.
        // This is a simple sort for prioritization, can be made more sophisticated.
        uniqueKeyEvents.sort((a, b) => {
            if (a.eventType === "First Transaction") return -1;
            if (b.eventType === "First Transaction") return 1;
            if (a.eventType.includes("Significant ETH Transfer")) return -1;
            if (b.eventType.includes("Significant ETH Transfer")) return 1;
            if (a.eventType === "Contract Deployment") return -1;
            if (b.eventType === "Contract Deployment") return 1;
            return a.timestamp - b.timestamp; // Fallback to chronological for others
        });
        return uniqueKeyEvents.slice(0, MAX_KEY_EVENTS).sort((a,b) => a.timestamp - b.timestamp); // Re-sort final slice by time
    }

    return uniqueKeyEvents;
  }

  // New method for historical activity metrics
  public async getHistoricalActivityMetrics(
    address: string,
    transactions: Transaction[], 
    currentEthPrice: number, 
    numberOfMonths: number = 12,
    referenceDateOverride?: Date // Added to allow overriding the "current" date
  ): Promise<HistoricalActivityMetric[]> {
    console.log(`[WalletService] getHistoricalActivityMetrics started for ${address} for ${numberOfMonths} months, referenceDateOverride: ${referenceDateOverride?.toISOString()}`);
    const metrics: HistoricalActivityMetric[] = [];
    const referenceDate = referenceDateOverride || new Date(); // Use override if provided, else now

    for (let i = 0; i < numberOfMonths; i++) {
      // Calculate target month relative to the referenceDate
      const targetMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const year = targetMonthDate.getFullYear();
      const month = targetMonthDate.getMonth(); // 0-11

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month

      // Ensure transactions are sorted by timestamp if not already guaranteed
      // transactions.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); 
      // getAllTransactions already sorts them, so this might be redundant but safe if called independently.

      const monthlyAnalysis = this.analyzerService.analyzeTransactions(
        transactions, 
        address, 
        currentEthPrice, 
        startDate, 
        endDate
      );

      metrics.push({
        month: `${year}-${(month + 1).toString().padStart(2, '0')}`, // Format YYYY-MM
        transactionCount: monthlyAnalysis.transactionCountInDateRange || 0,
      });
    }
    
    console.log(`[WalletService] getHistoricalActivityMetrics finished for ${address}. Metrics:`, metrics);
    return metrics.reverse(); // Return in chronological order (oldest month first)
  }

  // Renamed and refactored from _fetchTokenPriceFromEtherscan
  private async _fetchMissingTokenPriceWithMoralis(contractAddress: string): Promise<{ usdValue: number } | null> {
    if (!contractAddress || contractAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || contractAddress.toLowerCase() === '0x0000000000000000000000000000000000000000') {
        // Skip for native ETH placeholder or invalid/zero address
        console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Skipping address: ${contractAddress}`);
        return null;
    }
    try {
      console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Attempting to fetch price for contract: ${contractAddress}`);
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: contractAddress,
        chain: '0x1', 
      });

      console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Moralis getTokenPrice raw response for ${contractAddress}: `, JSON.stringify(response.raw, null, 2));
      
      let usdPrice = 0;

      if (response && response.raw && typeof response.raw.usdPrice === 'number' && response.raw.usdPrice > 0) {
        usdPrice = response.raw.usdPrice;
        console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Found price in response.raw.usdPrice for ${contractAddress}: ${usdPrice}`);
      } else if (response && response.result && typeof response.result.usdPrice === 'number' && response.result.usdPrice > 0) {
        // Fallback to response.result.usdPrice if raw.usdPrice is not available/valid
        usdPrice = response.result.usdPrice;
        console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Found price in response.result.usdPrice for ${contractAddress}: ${usdPrice}`);
      } else {
        console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - USD price not found or invalid in Moralis response for ${contractAddress}. Raw:`, response.raw, "Result:", response.result);
        return null;
      }

      if (usdPrice > 0) {
        return { usdValue: usdPrice };
      } else {
        console.log(`[WalletService] _fetchMissingTokenPriceWithMoralis - Final USD price is 0 or invalid for ${contractAddress}.`);
        return null;
      }

    } catch (error: any) {
      console.error(`[WalletService] _fetchMissingTokenPriceWithMoralis - Error fetching price for ${contractAddress}:`, error.message);
      if (error.details) {
        // Avoid JSON.stringify on potentially circular error.details
        console.error(`[WalletService] _fetchMissingTokenPriceWithMoralis - Additional error details exist for ${contractAddress} (not fully logged to avoid circular JSON issues). Status: ${error.details.status}`);
      }
      return null;
    }
  }

  async getWalletJourney(address: string, chain: string = '0x1', limit: number = 50, cursor?: string, fromDate?: string, toDate?: string, order: 'ASC' | 'DESC' = 'DESC', nftMetadata: boolean = true): Promise<WalletJourneyData> {
    try {
      console.log(`[WalletService getWalletJourney] Fetching wallet journey for ${address} on chain ${chain} with limit ${limit}, cursor: ${cursor}, fromDate: ${fromDate}, toDate: ${toDate}, order: ${order}, nftMetadata: ${nftMetadata}`);

      let parsedFromDate: Date | undefined = undefined;
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d.getTime())) {
          parsedFromDate = d;
          console.log(`[WalletService getWalletJourney] Parsed fromDate: ${parsedFromDate.toISOString()}`);
        } else {
          console.warn(`[WalletService getWalletJourney] Invalid fromDate string provided: ${fromDate}. Ignoring.`);
        }
      }

      let parsedToDate: Date | undefined = undefined;
      if (toDate) {
        const d = new Date(toDate);
        if (!isNaN(d.getTime())) {
          parsedToDate = d;
          console.log(`[WalletService getWalletJourney] Parsed toDate: ${parsedToDate.toISOString()}`);
        } else {
          console.warn(`[WalletService getWalletJourney] Invalid toDate string provided: ${toDate}. Ignoring.`);
        }
      }
      
      console.log(`[WalletService getWalletJourney] Calling Moralis.EvmApi.wallets.getWalletHistory with params:`, { address, chain, limit, cursor, fromDate: parsedFromDate, toDate: parsedToDate, order, nftMetadata });

      const response = await Moralis.EvmApi.wallets.getWalletHistory({
        address,
        chain,
        limit,
        cursor,
        fromDate: parsedFromDate, 
        toDate: parsedToDate,     
        order,
        nftMetadata,
      });

      // rawResult is directly the array of transactions from response.result
      const rawTransactions: any[] = response?.result || [];
      console.log(`[WalletService getWalletJourney] Moralis raw response transaction count: ${rawTransactions.length}`);
      console.log(`[WalletService getWalletJourney] Moralis raw response cursor: ${response?.pagination?.cursor}`);

      if (rawTransactions.length === 0) {
        console.log('[WalletService getWalletJourney] No transactions found in Moralis response.');
        return { events: [], nextCursor: response?.pagination?.cursor || null, hasMore: !!response?.pagination?.cursor };
      }
      
      console.log(`[WalletService getWalletJourney] Received ${rawTransactions.length} raw transactions from Moralis.`);

      const events: TimelineEvent[] = rawTransactions.map((tx: any, index: number): TimelineEvent | null => {
        try {
          // Logging to see the structure of tx directly
          if (index === 0) {
            console.log(`[WalletService getWalletJourney] RAW MORALIS TX OBJECT (HISTORY API, index 0, direct access type: ${typeof tx}):`, JSON.stringify(tx, null, 2).substring(0, 1000) + "...");
            Object.keys(tx).forEach(key => {
              if (key.toLowerCase().includes('address') || key.toLowerCase().includes('status') || key.toLowerCase().includes('fee')) {
                // @ts-ignore
                console.log(`[WalletService getWalletJourney] tx instance key sample: ${key} = ${tx[key]}`);
              }
            });
          }

          const finalTimestamp = tx.blockTimestamp || tx.block_timestamp; // Prefer camelCase from instance
          const finalBlockNumber = tx.blockNumber || tx.block_number;     // Prefer camelCase from instance

          if (!finalTimestamp) {
            console.warn(`[WalletService getWalletJourney] Missing timestamp for tx at index ${index}, hash: ${tx.hash}. Skipping.`);
            return null;
          }

          const details: TimelineEvent['details'] = {
            fromAddress: tx.fromAddress?.lowercase || '',
            fromAddressLabel: tx.fromAddressLabel || null,
            fromAddressEntity: tx.fromAddressEntity || null,
            fromAddressEntityLogo: tx.fromAddressEntityLogo || null,
            toAddress: tx.toAddress?.lowercase || '',
            toAddressLabel: tx.toAddressLabel || null,
            toAddressEntity: tx.toAddressEntity || null,
            toAddressEntityLogo: tx.toAddressEntityLogo || null,
            value: tx.value || "0", // value seems to be consistently lowercase string
            transactionFee: tx.transactionFee || "0",
            gasPrice: tx.gasPrice,
            methodLabel: tx.methodLabel || null,
            nftTransfers: [], // Will be populated below
            erc20Transfers: [], // Will be populated below
            nativeTransfers: [], // Will be populated below
            contractInteraction: undefined, // Will be populated if applicable
            possibleSpam: tx.possibleSpam || false,
            receiptStatus: (tx.receiptStatus === "1" ? "1" : "0") as '1' | '0',
            displayValue: undefined, // To be set later based on context
            displayValueToken: undefined, // To be set later
          };

          // Populate Native Transfers
          if (tx.nativeTransfers && Array.isArray(tx.nativeTransfers)) {
            details.nativeTransfers = tx.nativeTransfers.map((nt: any): NativeTransferDetail => {
              // console.log(`[WalletService getWalletJourney] RAW Native Transfer object (inside map): ${JSON.stringify(nt)}`);
              return {
                fromAddress: nt.from_address || '', // These are snake_case in the Moralis native_transfers array elements
                toAddress: nt.to_address || '',     // These are snake_case
                fromAddressLabel: nt.from_address_label || undefined,
                toAddressLabel: nt.to_address_label || undefined,
                value: nt.value || '0',
                valueFormatted: nt.value_formatted,
                direction: nt.direction,
                tokenSymbol: nt.token_symbol,
                tokenLogo: nt.token_logo,
                internalTransaction: !!nt.internal_transaction
              };
            });
          }

          // Populate ERC20 Transfers
          if (tx.erc20Transfers && Array.isArray(tx.erc20Transfers)) {
            details.erc20Transfers = tx.erc20Transfers.map((t: any) => ({
              tokenSymbol: t.tokenSymbol,
              tokenLogo: t.tokenLogo,
              tokenName: t.tokenName,
              tokenAddress: t.tokenAddress?.lowercase || t.tokenAddress,
              value: t.value,
              valueFormatted: t.valueFormatted,
              direction: t.direction,
              fromAddress: t.fromAddress?.lowercase || t.fromAddress,
              toAddress: t.toAddress?.lowercase || t.toAddress,
            }));
          }

          // Populate NFT Transfers
          if (tx.nftTransfers && Array.isArray(tx.nftTransfers)) {
            details.nftTransfers = tx.nftTransfers.map((n: any) => {
              let imageUrl = n.normalizedMetadata?.image;
              if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('ipfs://')) {
                imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }

              let collectionLogoUrl = n.collectionLogo; // This comes directly from Moralis history API for the transfer event
              if (collectionLogoUrl && typeof collectionLogoUrl === 'string' && collectionLogoUrl.startsWith('ipfs://')) {
                collectionLogoUrl = collectionLogoUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }
              
              // Also attempt to get image from normalizedMetadata.image_url if .image is not present
              if (!imageUrl && n.normalizedMetadata?.image_url && typeof n.normalizedMetadata.image_url === 'string') {
                imageUrl = n.normalizedMetadata.image_url;
                if (imageUrl.startsWith('ipfs://')) {
                    imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }
              }

              return {
                tokenAddress: n.tokenAddress?.lowercase || n.tokenAddress,
                tokenId: n.tokenId,
                value: n.value,
                amount: n.amount,
                contractType: n.contractType,
                direction: n.direction,
                name: n.normalizedMetadata?.name,
                image: imageUrl, 
                collectionLogo: collectionLogoUrl,
                fromAddress: n.fromAddress?.lowercase || n.fromAddress,
                toAddress: n.toAddress?.lowercase || n.toAddress,
              };
            });
          }

          let summary = tx.summary || ''; // Use Moralis summary if available

          // Set displayValue and displayValueToken based on category and transfers
          // This logic can be expanded significantly
          if (tx.category?.toLowerCase() === 'nft sale' || tx.category?.toLowerCase() === 'nft purchase') {
            const nftTransfer = details.nftTransfers?.[0];
            if (nftTransfer) {
              summary = `${tx.category === 'nft sale' ? 'Sold' : 'Bought'} ${nftTransfer.name || `NFT (${nftTransfer.tokenAddress?.substring(0,6)}...#${nftTransfer.tokenId})`}`;
              // For sales/purchases, the main tx.value is often the payment
              if (tx.value && tx.value !== "0") {
                  details.displayValue = ethers.formatEther(tx.value) + " ETH";
                  details.displayValueToken = "ETH";
              } else if (nftTransfer.value && nftTransfer.value !== "0") { // Fallback to NFT transfer value if tx.value is 0
                  details.displayValue = ethers.formatEther(nftTransfer.value) + " ETH"; // Assuming NFT value is in ETH for now
                  details.displayValueToken = "ETH";
              }
            }
          } else if (tx.category?.toLowerCase() === 'erc20 transfer') {
            const erc20Transfer = details.erc20Transfers?.[0];
            if (erc20Transfer) {
              summary = `${erc20Transfer.direction === 'receive' ? 'Received' : 'Sent'} ${erc20Transfer.valueFormatted || erc20Transfer.value} ${erc20Transfer.tokenSymbol}`;
              details.displayValue = `${erc20Transfer.valueFormatted || erc20Transfer.value}`;
              details.displayValueToken = erc20Transfer.tokenSymbol;
            }
          } else if (tx.category?.toLowerCase() === 'native transfer' || (tx.value && tx.value !== "0" && (!tx.category || tx.category.toLowerCase() === 'receive' || tx.category.toLowerCase() === 'send'))) {
             // For native transfers or simple sends/receives not otherwise categorized
            if (tx.value && tx.value !== "0") {
                details.displayValue = ethers.formatEther(tx.value) + " ETH";
                details.displayValueToken = "ETH";
                // Summary might be already good from Moralis, or construct one:
                // const direction = tx.fromAddress?.lowercase === address.toLowerCase() ? 'Sent' : 'Received';
                // summary = `${direction} ${details.displayValue}`;
            }
          } else if (tx.category?.toLowerCase() === 'token swap') {
            // For swaps, show what was sent and received if possible
            const sentToken = details.erc20Transfers?.find(t => t.direction === 'send');
            const receivedToken = details.erc20Transfers?.find(t => t.direction === 'receive');
            if (sentToken && receivedToken) {
                summary = `Swapped ${sentToken.valueFormatted || sentToken.value} ${sentToken.tokenSymbol} for ${receivedToken.valueFormatted || receivedToken.value} ${receivedToken.tokenSymbol}`;
                details.displayValue = summary; // Using the summary as the main display value here
            } else if (sentToken) {
                summary = `Sent ${sentToken.valueFormatted || sentToken.value} ${sentToken.tokenSymbol} in swap`;
            } else if (receivedToken) {
                summary = `Received ${receivedToken.valueFormatted || receivedToken.value} ${receivedToken.tokenSymbol} in swap`;
            }
          } else if (tx.value && tx.value !== "0") { // General fallback if value exists
             details.displayValue = ethers.formatEther(tx.value) + " ETH";
             details.displayValueToken = "ETH";
          }


          if (tx.category?.toLowerCase() === 'contract interaction' && tx.inputData) {
            details.contractInteraction = {
              inputData: tx.inputData,
              methodSignature: tx.inputData?.substring(0, 10), // First 4 bytes
            };
          }


          const mappedEvent: TimelineEvent = {
            hash: tx.hash,
            timestamp: finalTimestamp,
            blockNumber: finalBlockNumber?.toString(), // Ensure string
            category: tx.category || 'Unknown',
            summary: summary,
            details: details,
          };
          
          console.log(`[WalletService getWalletJourney] Mapped event.timestamp for hash ${tx.hash}: "${mappedEvent.timestamp}" (type: ${typeof mappedEvent.timestamp}), blockNumber: "${mappedEvent.blockNumber}" (type: ${typeof mappedEvent.blockNumber})`);
          return mappedEvent;

        } catch (mapError: any) {
          console.error(`[WalletService getWalletJourney] Error mapping transaction at index ${index}:`, JSON.stringify(tx).substring(0, 200) + "...", `Error: ${mapError.message}`);
          return null; 
        }
      }).filter((event): event is TimelineEvent => event !== null); 
      
      const nextCursor = response?.pagination?.cursor || null;
      const hasMore = !!nextCursor;

      console.log(`[WalletService getWalletJourney] Successfully mapped ${events.length} events. Next cursor: ${nextCursor}, Has more: ${hasMore}`);
      
      // Log first event if exists
      if (events.length > 0) {
        console.log(`[WalletService getWalletJourney] First mapped event (full object sample after attempting to map): ${JSON.stringify(events[0], null, 2)}...`);
      }


      return { events: events.filter(e => e !== null) as TimelineEvent[], nextCursor: response?.pagination?.cursor || null, hasMore: !!response?.pagination?.cursor };

    } catch (error: any) {
      console.error('[WalletService getWalletJourney] Error fetching wallet journey:', error.message);
      console.error('[WalletService getWalletJourney] Full error object:', JSON.stringify(error, null, 2));
      if (error.isMoralisError) {
        console.error('[WalletService getWalletJourney] Moralis Error Details:', JSON.stringify(error.details, null, 2));
      }
      throw new Error(`Failed to fetch wallet journey: ${error.message}`);
    }
  }
} 