import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { WalletService } from './services/WalletService';
import { WalletPersonaService } from './services/WalletPersonaService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Detailed CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API endpoint to analyze a wallet
app.post('/api/analyze-wallet', async (req, res) => {
  try {
    const { address } = req.body;
    
    console.log('Received request to analyze wallet:', address);
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Use the API key directly if not found in environment
    const apiKey = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0YzdkNDc5LTE4ODMtNGY1YS05YjRiLTRhOTA3NDQyODQ3YiIsIm9yZ0lkIjoiNDQ4MTY3IiwidXNlcklkIjoiNDYxMTA0IiwidHlwZUlkIjoiNDFkZWZkYjAtMjY0MC00NDM1LTk4NDEtZDY1ZGI2MTVmMTFiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDc3NTM0ODksImV4cCI6NDkwMzUxMzQ4OX0.UHCyuzpPgcRzjN6D-mEunTSpWUU7em-ByyCeiqJa4ic';
    
    // Use a public Ethereum RPC endpoint
    const rpcUrl = process.env.RPC_URL || 'https://ethereum-rpc.publicnode.com';
    
    console.log(`Analyzing wallet: ${address}`);
    
    const walletService = new WalletService(apiKey, rpcUrl);
    const personaService = new WalletPersonaService();
    
    // Fetch wallet details
    const details = await walletService.getWalletDetails(address);
    
    // Generate persona
    const persona = personaService.generatePersona(details);
    
    // Combine and return the data
    res.json({
      success: true,
      address,
      details,
      persona
    });
    
  } catch (error) {
    console.error('Error analyzing wallet:', error);
    res.status(500).json({ 
      error: 'Failed to analyze wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 