export interface WalletBalance {
  native: string;
  usdValue: number;
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  imageUrl?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
}

export interface WalletProfile {
  address: string;
  ensName?: string;
  firstTransactionDate?: Date;
  totalTransactions: number;
  totalValueReceived: number;
  totalValueSent: number;
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
} 