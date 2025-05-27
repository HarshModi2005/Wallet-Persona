Wallet API
Wallet API
Select what you want to achieve:

Get Wallet History
Get Wallet Token Balances
Get Wallet Token Approvals
Get Wallet Token Swaps
Get Wallet NFT Balances
Get Wallet DeFi Positions
Get Wallet Net-worth
Get Wallet PnL
Get Wallet Details
Get Wallet Domains
Get Wallet History
No.	Method	Description	API Reference	URL
1	getWalletHistory	Get full wallet history	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/history
2	getWalletTransactions	Get native transactions by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address
3	getWalletTransactionsVerbose	Get decoded transactions by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/verbose
4	getWalletTokenTransfers	Get ERC20 transfers by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/erc20/transfers
5	getWalletNFTTransfers	Get NFT transfers by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft/transfers
6	getNFTTradesByWallet	Get NFT trades by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/nfts/trades
Get Wallet Token Balances
No.	Method	Description	API Reference	URL
7	getWalletTokenBalances	Get ERC20 token balance by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/erc20
8	getWalletTokenBalancesPrices	Get Native & ERC20 token balances & prices by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/tokens
9	getNativeBalance	Get native balance by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/balance
10	getNativeBalancesForAddresses	Get native balance for multiple wallets	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/balances
Get Wallet Token Approvals
No.	Method	Description	API Reference	URL
11	getWalletApprovals	Get ERC20 approvals by wallet	Method Documentation	https://deep-index.moralis.io/api-docs-2.2/#/Wallets/getWalletApprovals
Get Wallet Token Swaps
No.	Method	Description	API Reference	URL
12	getSwapsByWalletAddress	Get swaps by wallet address	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/swaps
Get Wallet NFT Balances
No.	Method	Description	API Reference	URL
13	getWalletNFTs	Get NFTs by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft
14	getWalletNFTCollections	Get NFT collections by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft/collections
Get Wallet DeFi Positions
No.	Method	Description	API Reference	URL
15	getDefiSummary	Get DeFi protocols by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/defi/summary
16	getDefiPositionsSummary	Get DeFi positions by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/defi/positions
17	getDefiPositionsByProtocol	Get detailed DeFi positions by wallet and protocol	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/defi/:protocol/positions
Get Wallet Net-worth
No.	Method	Description	API Reference	URL
18	getWalletNetWorth	Get wallet net-worth	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/net-worth
Get Wallet PnL
No.	Method	Description	API Reference	URL
19	getWalletProfitabilitySummary	Get Wallet PnL Summary	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/profitability/summary
20	getWalletProfitability	Get Wallet PnL Breakdown	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/profitability
Get Wallet Details
No.	Method	Description	API Reference	URL
21	getWalletActiveChains	Get chain activity by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/chains
22	getWalletStats	Get wallet stats	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/stats
Get Wallet Domains
No.	Method	Description	API Reference	URL
23	resolveAddress	ENS Lookup by Address	Method Documentation	https://deep-index.moralis.io/api/v2.2/resolve/:address/reverse
24	resolveENSDomain	ENS Lookup by Domain	Method Documentation	https://deep-index.moralis.io/api/v2.2/resolve/ens/:domain
25	resolveAddressToDomain	Unstoppable Lookup by Address	Method Documentation	https://deep-index.moralis.io/api/v2.2/resolve/:address/domain
26	resolveDomain	Unstoppable Lookup by Domain	Method Documentation	https://deep-index.moralis.io/api/v2.2/resolve/:domain


NFT API
NFT API
Select what you want to achieve:

Get NFTs
Get NFT Metadata
Get NFT Transfers
Get NFT Collections
Get NFT Owners
Get NFT Prices
Get NFT Trades
Get NFT Stats
Get NFT Traits and Rarity
Get Trending NFTs
Get NFTs
No.	Method	Description	API Reference	URL	Spam Detection
1	getWalletNFTs	Get NFTs by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft	✅
2	getMultipleNFTs	Get multiple NFTs	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/getMultipleNFTs	✅
3	getContractNFTs	Get NFTs by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address	✅
Get NFT Metadata
No.	Method	Description	API Reference	URL	Spam Detection
4	reSyncMetadata	Resync metadata	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/metadata/resync	
5	getNFTMetadata	Get NFT data	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id	
Get NFT Transfers
No.	Method	Description	API Reference	URL	Spam Detection
6	getWalletNFTTransfers	Get transfers by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft/transfers	✅
7	getNFTContractTransfers	Get transfers by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/transfers	✅
8	getNFTTransfers	Get transfers by contract and token ID	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/transfers	✅
Get NFT Collections
No.	Method	Description	API Reference	URL	Spam Detection
9	getWalletNFTCollections	Get collections by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/nft/collections	✅
10	getNFTContractMetadata	Get contract metadata	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/metadata	✅
11	syncNFTContract	Sync NFT contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/sync	
Get NFT Owners
No.	Method	Description	API Reference	URL	Spam Detection
12	getNFTOwners	Get NFT owners	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/owners	✅
13	getNFTTokenIdOwners	Get token ID owners	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/owners	✅
Get NFT Prices
No.	Method	Description	API Reference	URL
14	getNFTFloorPriceByContract	Get NFT floor price by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/floor-price
15	getNFTFloorPriceByToken	Get NFT floor price by token	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/floor-price
16	getNFTHistoricalFloorPriceByContract	Get historical NFT floor price by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/floor-price/historical
17	getNFTContractSalePrices	Get contract sale prices	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/price
18	getNFTSalePrices	Get sale prices	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/price
Get NFT Trades
No.	Method	Description	API Reference	URL	Spam Detection
19	getNFTTrades	Get NFT trades	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/trades	✅
20	getNFTTradesByToken	Get trades by token	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/:token_id/trades	
21	getNFTTradesByWallet	Get trades by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/nfts/trades	
Get NFT Stats
No.	Method	Description	API Reference	URL	Spam Detection
22	getNFTCollectionStats	Get collection stats	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/stats	
Get NFT Traits and Rarity
No.	Method	Description	API Reference	URL	Spam Detection
23	getNFTTraitsByCollection	Get NFT traits by collection (single response, limited to 5,000 traits)	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/traits	
24	getNFTTraitsByCollectionPaginate	Get NFT traits by collection (paginated, no limit)	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/traits/paginate	
25	getNFTsByTraits	Get NFTs by traits	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/nfts-by-traits	✅
26	resyncNFTTraitsByCollection	Resync NFT traits by collection	Method Documentation	https://deep-index.moralis.io/api/v2.2/nft/:address/traits/resync	
Get Trending NFTs
No.	Method	Description	API Reference	URL
27	getTopNFTCollectionsByMarketCap	Get the top NFT collections by market cap	Method Documentation	https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections
28	getTopNFTCollectionsByTradingVolume	Get the top NFT collections by trading volume	Method Documentation	https://deep-index.moralis.io/api/v2.2/market-data/nfts/hottest-collections

Entity API
Entity API
Select what you want to achieve:

Search Entities
Get Entity Categories
Get Entities
Search Entities
No.	Method	Description	API Reference	URL
1	searchEntities	Search for entities, addresses, and categories	Method Documentation	https://deep-index.moralis.io/api/v2.2/entities/search
Get Entity Categories
No.	Method	Description	API Reference	URL
2	getEntityCategories	Get entity categories	Method Documentation	https://deep-index.moralis.io/api/v2.2/entities/categories
Get Entities
No.	Method	Description	API Reference	URL
3	getEntitiesByCategory	Get entities by category	Method Documentation	https://deep-index.moralis.io/api/v2.2/entities/categories/:categoryId
4	getEntity	Get entity by ID	Method Documentation	https://deep-index.moralis.io/api/v2.2/entities/:entit

Token API
Token API
Select what you want to achieve:

Get Token Balances
Get Token Approvals
Get Token Metadata
Get Token Price
Get Token Swaps
Get Token Transfers
Get Token Top Traders
Get Volume Stats
Get Token Pairs & Liquidity
Get Token Analytics
Get Tokens by Exchange
Get Token Stats
Get Token Holders
Get Token Snipers
Get Trending Tokens
Get Filtered Tokens
Search Tokens
Get Token Balances
No.	Method	Description	API Reference	URL
1	getWalletTokenBalances	Get ERC20 token balance by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/erc20
2	getWalletTokenBalancesPrices	Get Native & ERC20 token balances & prices by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/tokens
Get Token Approvals
No.	Method	Description	API Reference	URL
3	getWalletApprovals	Get ERC20 approvals by wallet	Method Documentation	https://deep-index.moralis.io/api-docs-2.2/#/Wallets/getWalletApprovals
Get Token Metadata
No.	Method	Description	API Reference	URL
4	getTokenMetadataBySymbol	Get ERC20 token metadata by symbols	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/metadata/symbols
5	getTokenMetadata	Get ERC20 token metadata by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/metadata
6	getDiscoveryToken	Get token details	Method Documentation	https://deep-index.moralis.io/api/v2.2/discovery/token
Get Token Price
No.	Method	Description	API Reference	URL
7	getTokenPrice	Get ERC20 token price	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/price
8	getMultipleTokenPrices	Get multiple token prices	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/prices
9	getPairCandlesticks	Get the OHLCV candlesticks by using pair address	Method Documentation	https://deep-index.moralis.io/api/v2.2/pairs/:address/ohlcv
Get Token Swaps
No.	Method	Description	API Reference	URL
10	getSwapsByPairAddress	Get swaps by pair address	Method Documentation	https://deep-index.moralis.io/api/v2.2/pairs/:address/swaps
11	getSwapsByTokenAddress	Get swaps by ERC20 token address	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/swaps
12	getSwapsByWalletAddress	Get swaps by wallet address	Method Documentation	https://deep-index.moralis.io/api/v2.2/wallets/:address/swaps
Get Token Transfers
No.	Method	Description	API Reference	URL
13	getWalletTokenTransfers	Get ERC20 token transfers by wallet	Method Documentation	https://deep-index.moralis.io/api/v2.2/:address/erc20/transfers
14	getTokenTransfers	Get ERC20 token transfers by contract	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/transfers
Get Token Top Traders
No.	Method	Description	API Reference	URL
15	getTopProfitableWalletPerToken	Get Token Profitable Wallets	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/top-gainers
Get Volume Stats
No.	Method	Description	API Reference	URL
16	getVolumeStatsByChain	Get volume statistics by chain	Method Documentation	https://deep-index.moralis.io/api/v2.2/volume/chains
17	getVolumeStatsByCategory	Get volume and chain data by categories	Method Documentation	https://deep-index.moralis.io/api/v2.2/volume/categories?chain=eth
18	getTimeSeriesVolume	Retrieve timeseries volume data by chain	Method Documentation	https://deep-index.moralis.io/api/v2.2/volume/timeseries?chain=eth&timeframe=1d
19	getTimeSeriesVolumeByCategory	Retrieve timeseries volume data by category	Method Documentation	https://deep-index.moralis.io/api/v2.2/volume/timeseries/artificial-intelligence?chain=eth&timeframe=1d
Get Token Pairs & Liquidity
No.	Method	Description	API Reference	URL
20	getTokenPairs	Get token pairs by address	Method Documentation	https://deep-index.moralis.io/api/v2.2/:token_address/pairs
21	getPairStats	Get token pair statistics	Method Documentation	https://deep-index.moralis.io/api/v2.2//pairs/:address/stats
22	getAggregatedTokenPairStats	Get aggregated token pair statistics	Method Documentation	https://deep-index.moralis.io/api/v2.2/:token_address/pairs/stats
23	getPairAddress	Get DEX token pair address	Method Documentation	https://deep-index.moralis.io/api/v2.2/:token0_address/:token1_address/pairAddres
24	getPairReserves	Get DEX token pair reserves	Method Documentation	https://deep-index.moralis.io/api/v2.2/:pair_address/reserves
Get Token Analytics
No.	Method	Description	API Reference	URL
25	getTokenAnalytics	Get token analytics	Method Documentation	https://deep-index.moralis.io/api/v2.2/tokens/:address/analytics
26	getMultipleTokenAnalytics	Get multiple token analytics	Method Documentation	https://deep-index.moralis.io/api/v2.2/tokens/:address/analytics
27	getTimeSeriesTokenAnalytics	Get timeseries token analytics	Method Documentation	https://deep-index.moralis.io/api/v2.2/tokens//analytics/timeseries
Get Tokens by Exchange
No.	Method	Description	API Reference	URL
28	getNewTokensByExchange	Get newly launched tokens by exchange	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/exchange/:exchange/new
29	getBondingTokensByExchange	Get bonding tokens by exchange	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/exchange/:exchange/bonding
30	getGraduatedTokensByExchange	Get graduated tokens by exchange	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/exchange/:exchange/graduated
31	getTokenBondingStatus	Get token bonding status	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/bondingStatus
Get Token Stats
No.	Method	Description	API Reference	URL
32	getTokenStats	Get ERC20 token stats	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:address/stats
Get Token Holders
No.	Method	Description	API Reference	URL
32	getTokenHolders	Get ERC20 Token Holders	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:token_address/owners
33	getTokenHolderStats	Get ERC20 Token Holders Stats	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:token_address/holders
34	getHistoricalTokenHolders	Get ERC20 token holders Stats Timeseries	Method Documentation	https://deep-index.moralis.io/api/v2.2/erc20/:token_address/holders/historical
Get Token Snipers
No.	Method	Description	API Reference	URL
35	getSnipersByPairAddress	Get snipers by pair address	Method Documentation	https://deep-index.moralis.io/api/v2.2/pairs/:address/snipers
Get Trending Tokens
No.	Method	Description	API Reference	URL
36	getTrendingTokens	Get trending tokens	Method Documentation	https://deep-index.moralis.io/api/v2.2/tokens/trending
37	getTopGainersTokens	Get tokens with top gainers	Method Documentation	https://deep-index.moralis.io/api/v2.2/discovery/tokens/top-gainers
38	getTopLosersTokens	Get tokens with top losers	Method Documentation	https://deep-index.moralis.io/api/v2.2/discovery/tokens/top-losers
39	getTopERC20TokensByMarketCap	Get the top ERC20 tokens by market cap	Method Documentation	https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-tokens
Get Filtered Tokens
No.	Method	Description	API Reference	URL
40	getFilteredTokens	Get filtered tokens	Method Documentation	https://deep-index.moralis.io/api/v2.2/discovery/tokens
Search Tokens
No.	Method	Description	API Reference	URL
41	searchTokens	Search tokens	Method Documentation	https://deep-index.moralis.io/api/v2.2/tokens/search

