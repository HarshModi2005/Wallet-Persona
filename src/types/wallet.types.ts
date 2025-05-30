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

// --- START OF NEW DeFi Summary Types ---
export interface MoralisDeFiProjectedEarnings {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface MoralisDeFiAccountData {
  net_apy: number;
  health_factor: number | null; // Can be a very large number or null
}

export interface MoralisDeFiProtocolInSummary {
  protocol_name: string;
  protocol_id: string;
  protocol_url: string;
  protocol_logo: string;
  account_data: MoralisDeFiAccountData;
  total_usd_value: number;
  total_unclaimed_usd_value: number | null;
  total_projected_earnings_usd: MoralisDeFiProjectedEarnings;
  positions: number;
}

export interface MoralisDefiSummaryResponse {
  active_protocols: number;
  total_positions: number;
  total_usd_value: number;
  total_unclaimed_usd_value: number;
  protocols: MoralisDeFiProtocolInSummary[];
}
// --- END OF NEW DeFi Summary Types ---

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

  // Phase 1.B: Temporal Analysis
  avgTxPerDay?: number;
  avgTxPerWeek?: number;
  avgTxPerMonth?: number;
  txCountByDayOfWeek?: { [day: string]: number };
  txCountByHourOfDay?: { [hour: number]: number };

  // Phase 1.C: Basic Counterparty Analysis
  uniqueInteractedAddressesCount?: number;
  topInteractedAddresses?: { address: string; count: number }[];

  // NFT Analysis Fields
  totalNftsHeld?: number;
  uniqueNftCollectionsCount?: number;
  topNftCollections?: Array<{
    contractAddress: string;
    name?: string;
    symbol?: string;
    count: number;
    collectionLogo?: string;
    nfts: NFT[];
  }>;
  
  // Fields from CoreTransactionAnalysis (already added by previous step, ensure they are here)
  transactionCountInDateRange?: number;
  // totalFeesPaidEth?: number; // This is totalGasFeesPaidEth above
  // totalFeesPaidUsd?: number; // This is totalGasFeesPaidUsd above
  gasUsed?: number;
  uniqueContractInteractions?: number;
  contractInteractionFrequency?: { [address: string]: number };
  mostFrequentContract?: string;
  activeDays?: number;
  transactionFrequencyPerDay?: number;
  walletAgeInDays?: number;
  isLikelyBot?: boolean;
  suspiciousActivityScore?: number;
  riskFactors?: string[];

  // New DeFi field
  defiSummary?: MoralisDefiSummaryResponse;

  // DAO related (placeholders for now)
  daoGovernanceTokensHeld?: TokenBalance[];
  daoVotingActivity?: {
    snapshotVotes?: number;
    onChainVotes?: number;
    lastVoteDate?: Date;
  };
}

export interface WalletDetails {
  address: string;
  balance: WalletBalance;
  tokens: TokenBalance[];
  nfts: NFT[];
  transactions: Transaction[];
  profile: WalletProfile;
  defiSummary?: MoralisDefiSummaryResponse;
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

export interface NftTransferDetail {
  tokenAddress: string;
  tokenId?: string;
  value?: string; // For ERC1155, value of NFTs transferred
  amount?: string; // For ERC1155, number of NFTs transferred
  contractType: string; // e.g., ERC721, ERC1155
  direction: 'send' | 'receive' | string; // Moralis might use other strings
  name?: string; // From normalized_metadata
  image?: string; // From normalized_metadata
  collectionLogo?: string;
  fromAddress: string;
  toAddress: string;
}

export interface Erc20TransferDetail {
  tokenSymbol?: string;
  tokenLogo?: string;
  tokenName?: string;
  tokenAddress: string;
  value: string; // Amount of tokens
  valueFormatted?: string; // Formatted amount
  direction: 'send' | 'receive' | string;
  fromAddress: string;
  toAddress: string;
}

export interface NativeTransferDetail {
  value: string;
  valueFormatted?: string;
  direction: 'send' | 'receive' | string;
  fromAddress: string;
  fromAddressLabel?: string;
  toAddress: string;
  toAddressLabel?: string;
  tokenSymbol?: string; // e.g., ETH
  tokenLogo?: string;
  internalTransaction?: boolean;
}

export interface ApprovalDetail {
  value?: string;
  valueFormatted?: string;
  token?: {
    address: string;
    address_label?: string;
    token_name?: string;
    token_logo?: string;
    token_symbol?: string;
  };
  spender?: {
    address: string;
    address_label?: string;
  };
}

export interface ContractInteractionDetail {
  approvals?: ApprovalDetail[];
  inputData?: string;
  methodSignature?: string;
}

export interface TimelineEvent {
  hash: string;
  timestamp: string;
  blockNumber: string;
  category: string;
  summary?: string;
  details: {
    fromAddress: string;
    fromAddressLabel?: string | null;
    fromAddressEntity?: string | null;
    fromAddressEntityLogo?: string | null;
    toAddress: string;
    toAddressLabel?: string | null;
    toAddressEntity?: string | null;
    toAddressEntityLogo?: string | null;
    value: string;
    transactionFee: string;
    gasPrice?: string;
    methodLabel?: string;
    nftTransfers?: NftTransferDetail[];
    erc20Transfers?: Erc20TransferDetail[];
    nativeTransfers?: NativeTransferDetail[];
    contractInteraction?: ContractInteractionDetail;
    possibleSpam: boolean;
    receiptStatus: '1' | '0';
    displayValue?: string;
    displayValueToken?: string;
  };
}

export interface WalletJourneyData {
  events: TimelineEvent[];
  nextCursor?: string | null;
  hasMore: boolean;
} 