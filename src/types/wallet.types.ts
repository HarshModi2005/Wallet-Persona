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
  inputData?: string;      // Added to store raw input data
  methodSignature?: string; // Added for the 4-byte signature
  // Define further for set_approvals_all, revokes, set_revokes_all if needed based on Moralis structure
}

export interface TimelineEvent {
  hash: string;
  timestamp: string;
  blockNumber: string;
  category: string;
  summary?: string; // Moralis provides this, can be very useful
  details: {
    fromAddress: string; // Transaction sender
    fromAddressLabel?: string | null;
    fromAddressEntity?: string | null; // e.g. "OpenSea"
    fromAddressEntityLogo?: string | null;
    toAddress: string; // Transaction recipient (often a contract)
    toAddressLabel?: string | null;
    toAddressEntity?: string | null; // e.g. "OpenSea: Seaport"
    toAddressEntityLogo?: string | null;
    value: string; // Native value of the transaction (e.g., ETH sent)
    transactionFee: string;
    gasPrice?: string;
    methodLabel?: string; // Decoded method call, if available
    nftTransfers?: NftTransferDetail[];
    erc20Transfers?: Erc20TransferDetail[];
    nativeTransfers?: NativeTransferDetail[]; // For internal native transfers
    contractInteraction?: ContractInteractionDetail; // Corrected typo, singular. And for specific contract call data.
    possibleSpam: boolean;
    receiptStatus: '1' | '0'; // 1 for success, 0 for failure
    displayValue?: string; // Added for user-friendly value display
    displayValueToken?: string; // Added to specify the token for displayValue (e.g., "ETH", "USDC")
  };
}

export interface WalletJourneyData {
  events: TimelineEvent[];
  nextCursor?: string | null;
  hasMore: boolean;
} 