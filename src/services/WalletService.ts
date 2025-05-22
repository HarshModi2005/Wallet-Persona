import Moralis from 'moralis';
import { ethers } from 'ethers';
import { 
  WalletDetails, 
  WalletBalance, 
  TokenBalance, 
  NFT, 
  Transaction,
  WalletProfile,
  DeFiPosition 
} from '../types/wallet.types';

export class WalletService {
  private provider: ethers.JsonRpcProvider;

  constructor(apiKey: string, rpcUrl: string) {
    // Initialize Moralis
    Moralis.start({
      apiKey
    });
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getWalletDetails(address: string): Promise<WalletDetails> {
    try {
      const [balance, tokens, nfts, transactions, profile, defiPositions] = await Promise.all([
        this.getNativeBalance(address),
        this.getTokenBalances(address),
        this.getNFTs(address),
        this.getTransactions(address),
        this.getWalletProfile(address),
        this.getDeFiPositions(address)
      ]);

      return {
        address,
        balance,
        tokens,
        nfts,
        transactions,
        profile,
        defiPositions
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
      usdValue: parseFloat(ethers.formatEther(balance)) * ethPrice
    };
  }

  private async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain: '0x1'
      });

      const result = response.result || [];
      return result.map((token: any) => ({
        contractAddress: token.token?.address || '',
        symbol: token.token?.symbol || '',
        name: token.token?.name || '',
        balance: token.amount?.toString() || '0',
        usdValue: parseFloat(token.amount?.toString() || '0') * (token.token?.usdPrice || 0)
      }));
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  private async getNFTs(address: string): Promise<NFT[]> {
    try {
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain: '0x1'
      });

      const result = response.result || [];
      return result.map((nft: any) => ({
        tokenId: nft.tokenId?.toString() || '',
        contractAddress: nft.tokenAddress?.toString() || '',
        name: nft.name || '',
        symbol: nft.symbol || '',
        imageUrl: nft.metadata && typeof nft.metadata === 'string' 
          ? JSON.parse(nft.metadata)?.image 
          : undefined
      }));
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  private async getTransactions(address: string): Promise<Transaction[]> {
    try {
      const response = await Moralis.EvmApi.transaction.getWalletTransactions({
        address,
        chain: '0x1'
      });

      const result = response.result || [];
      return result.map((tx: any) => ({
        hash: tx.hash || '',
        from: tx.from?.toString() || '',
        to: tx.to?.toString() || '',
        value: tx.value?.toString() || '0',
        timestamp: tx.blockTimestamp ? new Date(tx.blockTimestamp).getTime() / 1000 : 0,
        type: tx.from?.toString().toLowerCase() === address.toLowerCase() ? 'outgoing' : 'incoming'
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  private async getWalletProfile(address: string): Promise<WalletProfile> {
    const [ensName, transactions] = await Promise.all([
      this.provider.lookupAddress(address),
      this.getTransactions(address)
    ]);

    const firstTx = transactions[transactions.length - 1];
    const totalReceived = transactions
      .filter(tx => tx.type === 'incoming')
      .reduce((sum, tx) => sum + parseFloat(tx.value), 0);
    const totalSent = transactions
      .filter(tx => tx.type === 'outgoing')
      .reduce((sum, tx) => sum + parseFloat(tx.value), 0);

    return {
      address,
      ensName: ensName || undefined,
      firstTransactionDate: firstTx ? new Date(firstTx.timestamp * 1000) : undefined,
      totalTransactions: transactions.length,
      totalValueReceived: totalReceived,
      totalValueSent: totalSent
    };
  }

  private async getDeFiPositions(address: string): Promise<DeFiPosition[]> {
    // This is a placeholder - actual implementation would require
    // integration with specific DeFi protocols or aggregators
    return [];
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
} 