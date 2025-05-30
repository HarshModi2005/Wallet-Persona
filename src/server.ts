import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { WalletService } from './services/WalletService';
import { WalletPersonaService } from './services/WalletPersonaService';
import { GeminiAIService } from './services/GeminiAIService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize services once
const apiKey = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0YzdkNDc5LTE4ODMtNGY1YS05YjRiLTRhOTA3NDQyODQ3YiIsIm9yZ0lkIjoiNDQ4MTY3IiwidXNlcklkIjoiNDYxMTA0IiwidHlwZUlkIjoiNDFkZWZkYjAtMjY0MC00NDM1LTk4NDEtZDY1ZGI2MTVmMTFiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDc3NTM0ODksImV4cCI6NDkwMzUxMzQ4OX0.UHCyuzpPgcRzjN6D-mEunTSpWUU7em-ByyCeiqJa4ic';
const rpcUrl = process.env.RPC_URL || 'https://ethereum-rpc.publicnode.com';

const walletService = new WalletService(apiKey, rpcUrl);
// const geminiService = new GeminiAIService(process.env.GEMINI_API_KEY); // WalletPersonaService now creates its own
const walletPersonaService = new WalletPersonaService(); // Constructor takes no arguments now

// Detailed CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Check if environment variables are set
if (!process.env.MORALIS_API_KEY) {
  console.warn('Warning: MORALIS_API_KEY not set in .env file, using default key');
}

if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not set in .env file. AI features will be limited.');
  console.warn('Set GEMINI_API_KEY in .env file to enable advanced AI analysis features.');
}

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API endpoint to analyze a wallet
app.post('/api/analyze-wallet', async (req, res) => {
  try {
    const { address: rawAddress } = req.body;
    const { historicalSnapshotDate: rawHistoricalSnapshotDate } = req.query; // Get from query params
    
    console.log('Received request to analyze wallet:', rawAddress);
    console.log('Historical Snapshot Date (raw from query):', rawHistoricalSnapshotDate);
    
    if (!rawAddress || typeof rawAddress !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required and must be a string' });
    }

    const address = rawAddress.trim();
    let historicalSnapshotDate: string | undefined = undefined;

    if (rawHistoricalSnapshotDate && typeof rawHistoricalSnapshotDate === 'string') {
      // Basic validation for YYYY-MM-DD format, can be improved
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawHistoricalSnapshotDate)) {
        historicalSnapshotDate = rawHistoricalSnapshotDate;
        console.log('Using historical snapshot date:', historicalSnapshotDate);
      } else {
        console.warn('Invalid historicalSnapshotDate format, ignoring. Expected YYYY-MM-DD.');
      }
    }
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // API key and RPC URL are now used when services are initialized globally
    // const apiKey = process.env.MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM0YzdkNDc5LTE4ODMtNGY1YS05YjRiLTRhOTA3NDQyODQ3YiIsIm9yZ0lkIjoiNDQ4MTY3IiwidXNlcklkIjoiNDYxMTA0IiwidHlwZUlkIjoiNDFkZWZkYjAtMjY0MC00NDM1LTk4NDEtZDY1ZGI2MTVmMTFiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDc3NTM0ODksImV4cCI6NDkwMzUxMzQ4OX0.UHCyuzpPgcRzjN6D-mEunTSpWUU7em-ByyCeiqJa4ic';
    // const rpcUrl = process.env.RPC_URL || 'https://ethereum-rpc.publicnode.com';
    
    console.log(`Analyzing wallet: ${address} using pre-initialized services.`);
    
    // Use the global instances of the services
    // const walletService = new WalletService(apiKey, rpcUrl);
    // const personaService = new WalletPersonaService();
    
    try {
      // Fetch wallet details, passing the historicalSnapshotDate
      const details = await walletService.getWalletDetails(address, historicalSnapshotDate);
      
      // Generate persona with AI enhancement
      // Persona generation should ideally use the profile data as of the snapshot date too.
      // For now, WalletPersonaService is not aware of historicalSnapshotDate. This can be a future enhancement.
      const persona = await walletPersonaService.generatePersona(details);
      
      // Combine and return the data
      res.json({
        success: true,
        address,
        details,
        persona
      });
    } catch (serviceError) {
      console.error('Service error analyzing wallet:', serviceError);
      res.status(500).json({ 
        error: 'Failed to analyze wallet data',
        message: serviceError instanceof Error ? serviceError.message : 'Unknown service error'
      });
    }
  } catch (error) {
    console.error('General error analyzing wallet:', error);
    res.status(500).json({ 
      error: 'Failed to analyze wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/wallet-journey/:address', async (req, res) => {
  const { address } = req.params;
  const { chain, limit, cursor, fromDate, toDate, order, nftMetadata, includeInputData } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    console.log(`[Server] API /api/wallet-journey call for ${address} with query:`, req.query);
    const journeyData = await walletService.getWalletJourney(
      address,
      chain as string | undefined,
      limit ? parseInt(limit as string, 10) : undefined,
      cursor as string | undefined,
      fromDate as string | undefined,
      toDate as string | undefined,
      order as 'ASC' | 'DESC' | undefined,
      nftMetadata === 'true' || nftMetadata === undefined, // default true
      // includeInputData === 'true' || includeInputData === undefined // default true
    );

    // Log the journey data before sending, specifically checking timestamps
    if (journeyData && journeyData.events && journeyData.events.length > 0) {
      console.log(`[Server /api/wallet-journey] Data for ${address} before sending. Total events: ${journeyData.events.length}.`);
      journeyData.events.slice(0, 3).forEach((event, index) => {
        console.log(`[Server /api/wallet-journey] Event ${index} timestamp: "${event.timestamp}" (type: ${typeof event.timestamp})`);
      });
    } else if (journeyData) {
      console.log(`[Server /api/wallet-journey] Data for ${address} before sending. No events or empty events array. Cursor: ${journeyData.nextCursor}`);
    } else {
      console.log(`[Server /api/wallet-journey] journeyData is null or undefined for ${address} before attempting to send.`);
    }

    res.json(journeyData);
  } catch (error: any) {
    console.error(`[Server] Error in /api/wallet-journey for ${address}:`, error);
    res.status(500).json({ error: 'Failed to fetch wallet journey', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API enhanced with Gemini AI for wallet analysis${process.env.GEMINI_API_KEY ? '' : ' (Not configured)'}`);
}); 