export interface WalletBalance {
  native: string;
  usdValue: number;
  totalTokenUsdValue?: number;
  grandTotalUsdValue?: number;
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  moralisUsdPrice?: number; // Price from initial Moralis call
  priceSource?: 'Moralis Wallet API' | 'Moralis Price API Fallback' | 'Not Found';
  perTokenUsdPriceFromFallback?: number;
  decimals?: number;
  usdValueFormatted?: string;
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name?: string;
  symbol?: string;
  imageUrl?: string;
  collectionName?: string;
  collectionLogo?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  raw?: any;
}

export interface WalletProfile {
  address: string;
  ensName?: string;
  unstoppableDomain?: string;
  firstTransactionDate?: Date;
  lastTransactionDate?: Date;
  totalTransactions: number;
  totalValueReceived?: number;
  totalValueSent?: number;
  activeChains?: string[];
  uniqueTokenCount?: number;

  // Phase 1.A: Core Transaction Analysis & Derived Stats
  totalInboundTransactions?: number;
  totalOutboundTransactions?: number;
  totalContractCreationTransactions?: number;
  totalFailedTransactions?: number;
  totalGasFeesPaidEth?: number;
  totalGasFeesPaidUsd?: number;
  averageGasPriceGwei?: number;
  mostExpensiveTxHash?: string;
  mostExpensiveTxFeeEth?: number;
  mostExpensiveTxFeeUsd?: number;
  // Add more as we go

  // Phase 1.B: Temporal Analysis
  avgTxPerDay?: number;
  avgTxPerWeek?: number;
  avgTxPerMonth?: number;
  txCountByDayOfWeek?: { [day: string]: number };
  txCountByHourOfDay?: { [hour: number]: number };

  // Phase 1.C: Basic Counterparty Analysis
  uniqueInteractedAddressesCount?: number;
  topInteractedAddresses?: { address: string; count: number }[];

  // NFT Analysis Fields - ADDED HERE
  totalNftsHeld?: number;
  uniqueNftCollectionsCount?: number;
  topNftCollections?: Array<{
    contractAddress: string;
    name?: string;
    symbol?: string;
    count: number;
    collectionLogo?: string;
    nfts: NFT[]; // Sample NFTs from this collection
  }>;
}

export interface DeFiPosition {
  protocol: string;
  positionType: string;
  value: number;
  tokens: TokenBalance[];
}

export interface WalletDetails {
  address: string;
  balance: WalletBalance;
  tokens: TokenBalance[];
  nfts: NFT[];
  transactions: Transaction[];
  profile: WalletProfile;
  defiPositions: DeFiPosition[];
  historicalActivity?: HistoricalActivityMetric[];
  keyEvents?: KeyEvent[];
}

export interface HistoricalActivityMetric {
  month: string; // Format: YYYY-MM
  transactionCount: number;
}

export interface KeyEvent {
  timestamp: number; // Unix timestamp (seconds)
  eventType: string; // e.g., "First Transaction", "Significant Transfer", "NFT Interaction", "Contract Deployment", "High Gas Fee"
  description: string; // More detailed description of the event
  transactionHash?: string;
  value?: string; // e.g., ETH value for transfers
  relatedAddress?: string; // e.g., NFT contract address or counterparty
} 