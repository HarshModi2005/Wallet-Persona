# Wallet Persona Analyzer

<div align="center">
  <img src="./images/logo_transparent.png" alt="Wallet Persona Analyzer Logo" width="200"/>
  
  **An advanced blockchain wallet analysis platform that generates detailed on-chain personas for Ethereum wallet addresses using AI-powered insights and personalized NFT recommendations.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
</div>

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [AI Integration](#ai-integration)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Wallet Persona Analyzer is a sophisticated blockchain analytics platform that transforms raw Ethereum wallet data into comprehensive, AI-enhanced personality profiles with personalized NFT recommendations. The system analyzes transaction patterns, DeFi activity, NFT collections, and on-chain behavior to create detailed personas that reveal insights about cryptocurrency users' investment strategies, risk profiles, and blockchain engagement patterns.

### Key Differentiators

**AI-Powered Analysis**: Integration with Google Gemini AI provides intelligent pattern recognition and behavioral analysis beyond traditional on-chain metrics.

**Personalized NFT Recommendations**: Advanced recommendation engine that analyzes user behavior, market trends, and AI insights to suggest personalized NFT collections tailored to individual preferences and risk profiles.

**Comprehensive Data Sources**: Leverages Moralis API ecosystem and OpenSea API for extensive blockchain data including transactions, token balances, NFT holdings, DeFi positions, and cross-chain activity.

**Advanced Visualization**: Modern React-based dashboard with interactive charts, timelines, NFT portfolio analysis, and dynamic recommendation displays.

**Predictive Intelligence**: AI-generated recommendations, risk assessments, and investment insights based on historical behavior patterns and market analysis.

**Multi-Modal Personas**: Creates personalized avatars with voice narration, detailed biographies, and visual representations.

**Real-Time Analysis**: Live data processing with intelligent caching for optimal performance and up-to-date market data.

---

## Core Features

### Advanced NFT Recommendation Engine

**Intelligent Recommendation System**
- Multi-algorithm approach combining behavioral analysis, collaborative filtering, and content-based recommendations
- AI-powered market trend analysis and collection insights
- Personalized suggestions based on wallet history, risk tolerance, and investment patterns
- Real-time market data integration from OpenSea, NFTPort, and Alchemy APIs
- Budget-aware recommendations with customizable price ranges
- Risk-adjusted suggestions matching user trading profiles

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173339.png" alt="NFT Recommendation Engine" width="700"/>
  <p><em>AI-powered NFT recommendations with detailed market analysis and personalized insights based on wallet behavior</em></p>
</div>

<div align="center">
  <img src="./images/NFTSuggestions.png" alt="Personalized NFT Suggestions Showcase" width="700"/>
  <p><em>Showcase of personalized NFT suggestions, highlighting diverse collections and justifications.</em></p>
</div>

**NFT Portfolio Analysis**
- Comprehensive collection evaluation including rarity metrics and floor price analysis
- Trading pattern recognition (flipping vs. holding strategies)
- Portfolio diversification assessment across different NFT categories
- Market performance tracking and trend identification
- Cross-marketplace activity analysis and arbitrage opportunity detection

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173331.png" alt="NFT Portfolio Analysis" width="700"/>
  <p><em>Detailed NFT collection showcase with holdings breakdown and collection statistics</em></p>
</div>

**Market Intelligence Integration**
- Real-time floor price monitoring and volume analysis
- Trend detection for emerging collections and market opportunities
- Category-based analysis (PFP, Art, Gaming, Metaverse, Utility)
- Community strength metrics and holder behavior analysis
- Price prediction models based on historical data and market patterns

### Wallet Categorization Engine

The system employs a sophisticated categorization algorithm that analyzes transaction patterns, contract interactions, and asset holdings to classify wallets into distinct persona types:

**DeFi Investor Classification**
- Identifies liquidity providers through LP token analysis
- Detects yield farming strategies via protocol interaction patterns
- Analyzes lending/borrowing behavior across multiple platforms
- Tracks governance token holdings and voting participation
- Calculates DeFi risk exposure and protocol diversification

<div align="center">
  <img src="./images/DeFiPortfolio.png" alt="DeFi Portfolio Overview" width="700"/>
  <p><em>Overview of a user's DeFi portfolio, showing active protocols and positions.</em></p>
</div>

**NFT Collector Profiling**
- Comprehensive collection analysis including rarity metrics
- Trading pattern recognition (flipping vs. holding strategies)
- Cross-marketplace activity tracking
- Sentiment analysis based on collection choices
- Portfolio valuation and trend identification
- **NEW**: Personalized NFT recommendations based on existing collection patterns

**Active Trader Detection**
- High-frequency trading pattern analysis
- Arbitrage opportunity identification
- Gas optimization behavior assessment
- MEV (Maximal Extractable Value) strategy detection
- Cross-DEX activity correlation

**Long-term Investor (HODLer) Identification**
- Asset accumulation pattern analysis
- Dollar-cost averaging detection
- Long-term holding behavior assessment
- Portfolio stability metrics
- Market timing analysis

**Automated System Recognition**
- Bot behavior pattern detection
- MEV searcher identification
- Smart contract automation analysis
- Transaction frequency anomaly detection
- Gas price optimization algorithms

**DAO Governance Participation**
- Governance token portfolio analysis
- On-chain voting history tracking
- Proposal participation metrics
- Multi-DAO involvement assessment
- Governance influence scoring

### Advanced Risk Assessment Framework

**Multi-Dimensional Risk Scoring**

The platform implements a comprehensive risk assessment system combining deterministic analysis with AI-powered behavioral evaluation:

**Deterministic Risk Factors**
- Transaction frequency volatility analysis
- Counterparty diversity assessment
- Smart contract interaction complexity evaluation
- Gas fee optimization patterns
- Asset concentration risk calculation
- Temporal activity pattern analysis

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173405.png" alt="Detailed Transaction Analysis" width="700"/>
  <p><em>Comprehensive transaction analysis showing gas usage, activity patterns, and counterparty analysis</em></p>
</div>

**AI-Enhanced Risk Analysis**
- Behavioral anomaly detection using machine learning
- Pattern recognition for suspicious activities
- Smart contract interaction risk assessment
- Cross-reference with known risk databases
- Predictive risk modeling based on similar wallet behaviors

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173413.png" alt="Advanced Transaction Analysis" width="700"/>
  <p><em>Advanced transaction analysis with hourly activity patterns and detailed counterparty breakdown</em></p>
</div>

**Risk Score Calculation**
The final risk score (0-100 scale) combines:
- 50% deterministic algorithmic assessment
- 50% AI-powered behavioral analysis
- Weighted adjustments based on portfolio size and activity level
- Historical accuracy validation and calibration

### Comprehensive Activity Profiling

**Temporal Analysis Engine**
- Hour-of-day transaction pattern analysis
- Day-of-week activity distribution
- Seasonal trading behavior identification
- Market event correlation analysis
- Timezone inference based on activity patterns

**Value Flow Analysis**
- Inbound transaction pattern classification
- Outbound spending behavior analysis
- Value accumulation rate calculation
- Asset rotation frequency assessment
- Liquidity management strategy evaluation

**Network Effect Analysis**
- Connected address cluster identification
- Transaction graph analysis
- Influence network mapping
- Counterparty relationship assessment
- Ecosystem participation scoring

**Growth Metrics Calculation**
- Portfolio value trajectory analysis
- Return on investment calculations
- Risk-adjusted performance metrics
- Benchmark comparison analysis
- Performance attribution modeling

### Interactive Visualization Dashboard

**Asset Distribution Analytics**
- Real-time portfolio composition charts
- Token allocation optimization suggestions
- Diversification risk assessment
- Asset correlation analysis
- Rebalancing recommendations

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173319.png" alt="Analytics Dashboard" width="700"/>
  <p><em>Comprehensive analytics dashboard with asset distribution, risk assessment, and wallet profile highlights</em></p>
</div>

**Transaction Journey Timeline**
- Chronological transaction visualization
- Key event identification and marking
- Interactive drill-down capabilities
- Pattern recognition highlights
- Contextual transaction analysis

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173422.png" alt="Wallet Journey Timeline" width="700"/>
  <p><em>Interactive wallet journey timeline showing chronological transaction history with detailed event information</em></p>
</div>

**Activity Heatmap Generation**
- Geographic activity inference
- Temporal activity clustering
- Cross-platform usage patterns
- Peak activity identification
- Behavioral consistency mapping

**Performance Tracking Dashboard**
- Real-time portfolio valuation
- Historical performance charting
- Risk-adjusted return calculations
- Benchmark comparison metrics
- Performance attribution analysis

### AI-Generated Persona System

**Personalized Avatar Creation**
- AI-powered profile image generation based on trading behavior
- Style adaptation based on persona characteristics
- Custom artwork creation using advanced image generation APIs
- Avatar evolution based on changing behavior patterns

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173303.png" alt="AI-Generated Persona Avatar and Biography" width="700"/>
  <p><em>AI-generated persona with custom avatar and detailed behavioral biography</em></p>
</div>

**Voice Narration System**
- Text-to-speech integration using ElevenLabs API
- Personalized voice selection based on persona traits
- Dynamic script generation for wallet introductions
- Multi-language support capabilities

**Detailed Biography Generation**
- AI-written personality descriptions based on on-chain behavior
- Investment philosophy inference
- Risk tolerance assessment
- Market outlook prediction
- Behavioral psychology analysis

**Behavioral Insight Engine**
- Trading psychology evaluation
- Decision-making pattern analysis
- Emotional trading indicator detection
- Cognitive bias identification
- Investment motivation assessment

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173422.png" alt="Detailed Analysis Dashboard" width="700"/>
  <p><em>Comprehensive analysis dashboard with risk assessment and trading behavior insights</em></p>
</div>

---

## Architecture

### Frontend Architecture (React + TypeScript)

```
wallet-persona-frontend/
├── src/
│   ├── components/
│   │   ├── MainPersonaSection.js       # Primary persona display and overview
│   │   ├── BasicWalletInfo.js          # Address validation and basic metrics
│   │   ├── DetailedAnalysisSection.js  # Risk assessment and trading analysis
│   │   ├── NftAnalysisSection.js       # NFT portfolio and collection analysis
│   │   ├── NFTRecommendationSection.js # Personalized NFT recommendations display
│   │   ├── NftRecommendations/         # NFT recommendation components directory
│   │   ├── AssetDistributionChart.js   # Token allocation and diversification
│   │   ├── WalletJourneyTimeline.js    # Transaction history and key events
│   │   ├── DeFiSummarySection.js       # DeFi positions and protocol analysis
│   │   └── VisTimeline.js              # Advanced timeline visualization
│   ├── App.js                          # Main application orchestration
│   ├── App.css                         # Comprehensive styling and animations
│   └── index.js                        # React application entry point
├── public/
│   ├── index.html                      # HTML template with meta tags
│   └── logo_transparent.png            # Application branding assets
└── package.json                        # Dependencies and build configuration
```

### Backend Architecture (Node.js + Express + TypeScript)

```
src/
├── services/
│   ├── WalletService.ts               # Core blockchain data aggregation
│   ├── WalletPersonaService.ts        # Persona generation orchestration
│   ├── GeminiAIService.ts            # AI analysis and pattern recognition
│   ├── TransactionAnalyzerService.ts  # Transaction pattern analysis engine
│   ├── NFTRecommendationService.ts   # Advanced NFT recommendation algorithms
│   ├── OpenSeaService.ts             # OpenSea API integration for NFT data
│   ├── ImageGenerationService.ts     # Avatar image creation service
│   └── ElevenLabsService.ts          # Voice synthesis integration
├── types/
│   ├── wallet.types.ts               # Comprehensive TypeScript interfaces
│   └── opensea.types.ts              # OpenSea-specific type definitions
├── server.ts                         # Express server configuration and routing
└── index.ts                          # Application entry point and initialization
```

### Data Integration Layer

**Moralis Web3 API Integration**
- Comprehensive blockchain data retrieval
- Multi-chain transaction history
- Token balance and metadata
- NFT collection and ownership data
- DeFi position tracking
- Real-time price feeds

**OpenSea API Integration**
- NFT collection metadata and floor prices
- Real-time market data and sales history
- Collection statistics and trending analysis
- Cross-marketplace data aggregation
- Rarity and trait information

**NFTPort & Alchemy API Integration**
- Enhanced NFT metadata and analytics
- Collection performance metrics
- Market trend analysis and predictions
- Advanced NFT portfolio insights

**Google Gemini AI Integration**
- Advanced pattern recognition
- Natural language generation
- Behavioral analysis
- Risk assessment modeling
- NFT recommendation generation

**ElevenLabs Voice Synthesis**
- High-quality text-to-speech conversion
- Voice personality matching
- Multi-language support
- Custom voice training capabilities

**Image Generation Services**
- AI-powered avatar creation
- Style-consistent artwork generation
- Persona-based visual representation
- Dynamic image optimization

---

## Installation

### System Requirements

**Development Environment**
- Node.js version 16.0 or higher
- npm package manager version 8.0 or higher
- TypeScript compiler version 4.9 or higher
- Modern web browser with ES2020 support

**API Dependencies**
- Moralis API key (required for blockchain data)
- Google Gemini AI API key (required for AI features)
- ElevenLabs API key (optional for voice synthesis)
- Image Generation API key (optional for avatar creation)

**Hardware Requirements**
- Minimum 4GB RAM for development
- 8GB RAM recommended for optimal performance
- SSD storage for faster build times
- Stable internet connection for API calls

### Installation Process

**1. Repository Setup**
```bash
# Clone the repository
git clone https://github.com/your-username/wallet-persona-analyzer.git
cd wallet-persona-analyzer

# Verify Node.js installation
node --version  # Should be 16.0 or higher
npm --version   # Should be 8.0 or higher
```

**2. Backend Dependencies Installation**
```bash
# Install backend dependencies
npm install

# Verify TypeScript installation
npx tsc --version

# Install additional development tools
npm install -g ts-node-dev concurrently
```

**3. Frontend Dependencies Installation**
```bash
# Navigate to frontend directory
cd wallet-persona-frontend

# Install React dependencies
npm install

# Verify React installation
npm list react react-dom

# Return to project root
cd ..
```

**4. Environment Configuration**

Create a `.env` file in the project root directory:

```env
# Required API Configuration
MORALIS_API_KEY=your_moralis_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# NFT Data APIs (Required for NFT Recommendations)
OPENSEA_API_KEY=your_opensea_api_key_here
NFTPORT_API_KEY=your_nftport_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Blockchain Configuration
RPC_URL=https://ethereum-rpc.publicnode.com
DEFAULT_CHAIN=eth
SUPPORTED_CHAINS=eth,polygon,bsc,arbitrum

# AI Model Configuration
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192
AI_CACHE_DURATION=3600

# Optional AI Enhancement APIs
IMAGE_API_KEY=your_image_generation_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=default_voice_id

# Performance Configuration
CACHE_DURATION=1800
MAX_CONCURRENT_REQUESTS=25
REQUEST_TIMEOUT=45000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Database Configuration (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_persona
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true

# Security Configuration
API_KEY_ROTATION_INTERVAL=604800
ENABLE_ANALYTICS=true
ANALYTICS_SAMPLE_RATE=0.1
```

**5. Development Server Startup**

```bash
# Option 1: Start both frontend and backend simultaneously
npm run dev

# Option 2: Start services individually
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Option 3: Use convenience script
chmod +x start-dev.sh
./start-dev.sh
```

**6. Application Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/test

### Production Deployment

**Build Process**
```bash
# Create production builds
npm run build

# This will:
# 1. Compile TypeScript backend to JavaScript
# 2. Create optimized React production build
# 3. Generate static assets for deployment
```

**Production Environment Setup**
```env
# Production .env configuration
NODE_ENV=production
PORT=3001

# API Configuration
MORALIS_API_KEY=your_production_moralis_key
GEMINI_API_KEY=your_production_gemini_key

# Security Configuration
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Performance Configuration
CACHE_DURATION=7200
MAX_CONCURRENT_REQUESTS=50
```

**Production Startup**
```bash
# Start production server
npm start

# Monitor application logs
npm run logs

# Health check
curl http://localhost:3001/api/test
```

---

## API Documentation

### Analyze Wallet Endpoint

**POST** `/api/analyze-wallet`

Generates a comprehensive persona analysis for an Ethereum wallet address.

#### Request Body
```json
{
  "address": "0x1234567890123456789012345678901234567890"
}
```

#### Query Parameters
- `historicalSnapshotDate` (optional): Analyze wallet state as of specific date (YYYY-MM-DD format)

#### Response Structure
```json
{
  "success": true,
  "address": "0x1234567890123456789012345678901234567890",
  "details": {
    "address": "string",
    "balance": {
      "native": "string",
      "usdValue": "number",
      "totalTokenUsdValue": "number",
      "grandTotalUsdValue": "number"
    },
    "tokens": [
      {
        "contractAddress": "string",
        "symbol": "string",
        "name": "string",
        "balance": "string",
        "usdValue": "number",
        "priceSource": "string"
      }
    ],
    "nfts": [
      {
        "tokenId": "string",
        "contractAddress": "string",
        "name": "string",
        "imageUrl": "string",
        "collectionName": "string"
      }
    ],
    "transactions": "array",
    "profile": {
      "totalTransactions": "number",
      "firstTransactionDate": "string",
      "lastTransactionDate": "string",
      "totalGasFeesPaidEth": "number",
      "avgTxPerDay": "number",
      "riskFactors": "array"
    },
    "defiSummary": {
      "total_usd_value": "number",
      "active_protocols": "number",
      "protocols": "array"
    }
  },
  "persona": {
    "category": ["DeFi Investor", "NFT Collector"],
    "userCategory": "Advanced DeFi User",
    "riskScore": 65,
    "activeLevel": "Very Active",
    "tradingProfile": "Strategic Investor",
    "bio": "AI-generated biography describing trading behavior and investment strategy",
    "avatarName": "CryptoSage",
    "avatarImageUrl": "data:image/png;base64,...",
    "nftRecommendations": [
      {
        "contractAddress": "string",
        "collectionName": "string",
        "floorPrice": "number",
        "volume24h": "number",
        "priceChange24h": "number",
        "recommendationScore": "number",
        "recommendationReason": "string",
        "category": "trending | similar_style | undervalued | blue_chip | emerging",
        "riskLevel": "low | medium | high",
        "aiInsight": "string"
      }
    ],
    "recommendations": {
      "tokens": ["USDC", "WETH"],
      "dapps": ["Uniswap", "Compound"],
      "actionableInsights": ["Diversify DeFi exposure", "Consider yield optimization"]
    },
    "activitySummary": {
      "lastActivityDate": "2024-01-15",
      "totalInflowETH": 15.5,
      "totalOutflowETH": 12.3,
      "avgTransactionValueETH": 0.8,
      "transactionCount": 450
    }
  }
}
```

### Wallet Journey Endpoint

**GET** `/api/wallet-journey/:address`

Retrieves detailed transaction timeline and activity progression for comprehensive behavior analysis.

#### URL Parameters
- `address`: Ethereum wallet address (required)

#### Query Parameters
- `chain` (optional): Blockchain network identifier (default: "eth")
- `limit` (optional): Maximum number of transactions to return (default: 100, max: 500)
- `cursor` (optional): Pagination cursor for subsequent requests
- `fromDate` (optional): Start date filter (ISO 8601 format)
- `toDate` (optional): End date filter (ISO 8601 format)
- `order` (optional): Sort order ("ASC" or "DESC", default: "DESC")
- `nftMetadata` (optional): Include NFT metadata (default: true)

#### Response Structure
```json
{
  "events": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "blockNumber": 18500000,
      "transactionHash": "0x...",
      "eventType": "Token Transfer",
      "description": "Transferred 100 USDC to 0x...",
      "value": "100",
      "gasUsed": 21000,
      "gasPriceGwei": 25,
      "fromAddress": "0x...",
      "toAddress": "0x...",
      "tokenDetails": {
        "symbol": "USDC",
        "name": "USD Coin",
        "contractAddress": "0x..."
      }
    }
  ],
  "nextCursor": "eyJ0aW1lc3RhbXAiOjE3MDUzMjA2MDAsImJsb2NrIjoxODUwMDAwMH0",
  "hasMore": true,
  "totalCount": 1250
}
```

---

## Usage Examples

### Basic Wallet Analysis

**Frontend Implementation**
```javascript
import axios from 'axios';

const analyzeWallet = async (address) => {
  try {
    const response = await axios.post('/api/analyze-wallet', { 
      address: address.toLowerCase().trim() 
    });
    
    const { details, persona } = response.data;
    
    // Extract key metrics
    console.log('Wallet Categories:', persona.category);
    console.log('Risk Score:', persona.riskScore);
    console.log('Activity Level:', persona.activeLevel);
    console.log('Total Portfolio Value:', details.balance.grandTotalUsdValue);
    console.log('DeFi Exposure:', details.defiSummary?.total_usd_value || 0);
    
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error.response?.data || error.message);
    throw error;
  }
};

// Analyze a popular DeFi wallet (Vitalik Buterin's address)
analyzeWallet('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  .then(data => console.log('Analysis complete:', data))
  .catch(error => console.error('Error:', error));
```

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173312.png" alt="Basic Wallet Information Display" width="700"/>
  <p><em>Activity snapshot, portfolio overview, and chain information showing wallet fundamentals</em></p>
</div>

### Advanced Metrics Extraction

**Risk Assessment Analysis**
```javascript
const extractRiskAnalysis = (walletData) => {
  const { persona, details } = walletData;
  
  // Comprehensive risk breakdown
  const riskAnalysis = {
    overallScore: persona.riskScore,
    deterministic: {
      score: persona.riskFactorsDetails?.deterministicScore,
      factors: persona.riskFactorsDetails?.deterministicFactors || []
    },
    aiAssessment: {
      score: persona.riskFactorsDetails?.aiScore,
      factors: persona.riskFactorsDetails?.aiFactors || []
    },
    finalFactors: persona.riskFactorsDetails?.finalFactors || []
  };
  
  // Portfolio concentration risk
  const portfolioAnalysis = {
    tokenDiversification: details.tokens?.length || 0,
    largestPosition: Math.max(...(details.tokens?.map(t => t.usdValue) || [0])),
    nftExposure: details.nfts?.length || 0,
    defiExposure: details.defiSummary?.total_usd_value || 0
  };
  
  return { riskAnalysis, portfolioAnalysis };
};
```

**NFT Recommendation Analysis**
```javascript
const analyzeNFTRecommendations = (nftRecommendations) => {
  if (!nftRecommendations || nftRecommendations.length === 0) return null;
  
  const analysis = {
    totalRecommendations: nftRecommendations.length,
    categories: {},
    riskDistribution: {},
    priceRange: {
      min: Math.min(...nftRecommendations.map(r => r.floorPrice)),
      max: Math.max(...nftRecommendations.map(r => r.floorPrice)),
      average: nftRecommendations.reduce((sum, r) => sum + r.floorPrice, 0) / nftRecommendations.length
    },
    topRecommendations: nftRecommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3)
  };
  
  // Group by category and risk level
  nftRecommendations.forEach(rec => {
    analysis.categories[rec.category] = (analysis.categories[rec.category] || 0) + 1;
    analysis.riskDistribution[rec.riskLevel] = (analysis.riskDistribution[rec.riskLevel] || 0) + 1;
  });
  
  return analysis;
};

// Usage example
const walletData = await analyzeWallet('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
const nftAnalysis = analyzeNFTRecommendations(walletData.persona.nftRecommendations);
console.log('NFT Recommendations Analysis:', nftAnalysis);
```

**DeFi Position Analysis**
```javascript
const analyzeDeFiPositions = (defiSummary) => {
  if (!defiSummary) return null;
  
  const analysis = {
    totalValue: defiSummary.total_usd_value,
    activeProtocols: defiSummary.active_protocols,
    diversification: defiSummary.protocols?.length || 0,
    protocolBreakdown: defiSummary.protocols?.map(protocol => ({
      name: protocol.protocol_name,
      value: protocol.total_usd_value,
      apy: protocol.account_data?.net_apy || 0,
      healthFactor: protocol.account_data?.health_factor,
      positions: protocol.positions
    })) || []
  };
  
  // Calculate risk metrics
  analysis.averageAPY = analysis.protocolBreakdown.reduce((sum, p) => sum + p.apy, 0) / analysis.protocolBreakdown.length;
  analysis.minHealthFactor = Math.min(...analysis.protocolBreakdown.map(p => p.healthFactor || Infinity));
  
  return analysis;
};
```

### Custom Visualization Implementation

**Asset Distribution Chart**
```javascript
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const createAssetDistributionChart = (tokens, canvasId) => {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  // Prepare data for visualization
  const chartData = tokens
    .filter(token => token.usdValue > 0)
    .sort((a, b) => b.usdValue - a.usdValue)
    .slice(0, 10) // Top 10 assets
    .map(token => ({
      label: token.symbol,
      value: token.usdValue,
      percentage: (token.usdValue / tokens.reduce((sum, t) => sum + t.usdValue, 0) * 100).toFixed(2)
    }));
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.map(item => `${item.label} (${item.percentage}%)`),
      datasets: [{
        data: chartData.map(item => item.value),
        backgroundColor: chartData.map((_, index) => `hsl(${index * 360 / chartData.length}, 70%, 60%)`),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = chartData[context.dataIndex];
              return `${item.label}: $${item.value.toLocaleString()} (${item.percentage}%)`;
            }
          }
        }
      }
    }
  });
};
```

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173436.png" alt="Advanced Visualization Features" width="700"/>
  <p><em>Interactive charts and advanced visualization components for portfolio analysis</em></p>
</div>

---

## AI Integration

### Google Gemini AI Implementation

The application leverages Google's Gemini AI for sophisticated analysis beyond traditional on-chain metrics:

**Transaction Pattern Analysis Engine**
- Identifies complex trading strategies through temporal pattern recognition
- Detects behavioral anomalies that may indicate bot activity or market manipulation
- Recognizes investment patterns such as dollar-cost averaging, momentum trading, or contrarian strategies
- Analyzes gas optimization behavior to infer trader sophistication level

**Advanced Risk Assessment Framework**
- Multi-dimensional risk scoring that considers both quantitative metrics and qualitative behavior patterns
- Predictive risk modeling using historical data from similar wallet profiles
- Contextual risk factor identification that adapts to market conditions and protocol-specific risks
- Integration with real-time security databases for fraud and scam detection

**NFT Recommendation Intelligence**
- Analyzes user's NFT collection patterns and trading behavior to understand aesthetic preferences
- Generates personalized collection suggestions based on risk tolerance and investment patterns
- Provides market timing insights for NFT purchases and sales
- Creates detailed reasoning for each recommendation with market context and trend analysis
- Predicts collection performance based on community strength, utility, and market dynamics

**Natural Language Persona Generation**
- Generates human-readable personality descriptions based on complex on-chain behavior analysis
- Extracts personality traits from trading patterns, risk tolerance from position sizing, and investment philosophy from asset selection
- Creates contextual investment psychology profiles that explain motivation behind trading decisions
- Produces detailed NFT collection insights and personalized recommendation narratives

**Intelligent Recommendation System**
- Personalized token suggestions based on historical preferences, risk profile, and portfolio optimization principles
- DApp recommendations that align with user behavior patterns and complement existing DeFi positions
- NFT collection recommendations with detailed market analysis and timing insights
- Educational content curation tailored to user's current knowledge level and areas of interest

<div align="center">
  <img src="./images/Screenshot 2025-06-01 173436.png" alt="Interactive Wallet Persona Bot" width="400"/>
  <p><em>AI-powered chatbot interface allowing users to interact directly with their wallet persona for recommendations and insights</em></p>
</div>

### AI Configuration and Customization

**Environment Setup**
```bash
# Obtain API key from Google AI Studio
export GEMINI_API_KEY="your_gemini_api_key_here"

# Configure model parameters in .env
GEMINI_MODEL="gemini-1.5-pro"
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# NFT Recommendation APIs
export OPENSEA_API_KEY="your_opensea_api_key_here"
export NFTPORT_API_KEY="your_nftport_api_key_here"
export ALCHEMY_API_KEY="your_alchemy_api_key_here"
```

**Custom NFT Recommendation Configuration**
```typescript
// Example: Custom NFT recommendation preferences
interface NFTPreferenceProfile {
  preferredCategories: string[];
  avgPurchasePrice: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  tradingFrequency: 'holder' | 'flipper' | 'mixed';
  favoriteMarketplaces: string[];
  preferredArtStyles: string[];
  budgetRange: { min: number; max: number };
  timeHorizon: 'short' | 'medium' | 'long';
}

// Implementation in NFTRecommendationService.ts
export class NFTRecommendationService {
  async generateNFTRecommendations(
    walletDetails: WalletDetails,
    preferences?: Partial<NFTPreferenceProfile>
  ): Promise<NFTRecommendation[]> {
    // Multi-algorithm approach combining:
    // 1. Behavioral analysis
    // 2. Collaborative filtering
    // 3. Content-based recommendations
    // 4. AI-powered market insights
    
    const userProfile = await this.analyzeUserNFTProfile(walletDetails);
    const mergedPreferences = { ...userProfile, ...preferences };
    
    const [trendingRecs, similarStyleRecs, undervaluedRecs, aiPoweredRecs] = await Promise.all([
      this.getTrendingRecommendations(mergedPreferences),
      this.getSimilarStyleRecommendations(walletDetails.nfts, mergedPreferences),
      this.getUndervaluedRecommendations(mergedPreferences),
      this.getAIPoweredRecommendations(walletDetails, mergedPreferences)
    ]);
    
    return this.deduplicateAndScore([
      ...trendingRecs,
      ...similarStyleRecs,
      ...undervaluedRecs,
      ...aiPoweredRecs
    ], mergedPreferences);
  }
}
```

**Custom Analysis Prompts**
```typescript
// Example: Custom DeFi strategy analysis prompt
const customDeFiAnalysisPrompt = `
Analyze this wallet's DeFi interaction patterns and provide detailed insights about:

1. **Risk Management Strategy**: 
   - Position sizing methodology
   - Diversification approach across protocols
   - Hedging strategies employed

2. **Yield Optimization Approach**:
   - Preference for stable vs high-yield opportunities
   - Active management vs passive strategy
   - Compound frequency and reinvestment patterns

3. **Protocol Loyalty vs Exploration**:
   - Tendency to stick with familiar protocols
   - Early adoption of new DeFi innovations
   - Multi-chain strategy implementation

4. **Market Timing Behavior**:
   - Entry/exit timing relative to market cycles
   - Response to protocol governance changes
   - Adaptation to changing yield environments

Transaction History: {transactionData}
Current Positions: {defiPositions}
Market Context: {marketConditions}
`;

// Implementation in GeminiAIService.ts
export class GeminiAIService {
  async analyzeCustomDeFiStrategy(walletData: WalletDetails): Promise<DeFiStrategyAnalysis> {
    const prompt = this.buildCustomPrompt(customDeFiAnalysisPrompt, walletData);
    const response = await this.geminiClient.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more analytical response
        maxOutputTokens: 4096
      }
    });
    
    return this.parseStructuredResponse(response.response.text());
  }
}
```

---

## Configuration

### Environment Variables

**Required Configuration**
```env
# Core API Keys (Required)
MORALIS_API_KEY=your_moralis_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# NFT Data APIs (Required for NFT Recommendations)
OPENSEA_API_KEY=your_opensea_api_key_here
NFTPORT_API_KEY=your_nftport_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Blockchain Configuration
RPC_URL=https://ethereum-rpc.publicnode.com
DEFAULT_CHAIN=eth
SUPPORTED_CHAINS=eth,polygon,bsc,arbitrum

# AI Model Configuration
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192
AI_CACHE_DURATION=3600

# Optional AI Enhancement APIs
IMAGE_API_KEY=your_image_generation_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=default_voice_id

# Performance Configuration
CACHE_DURATION=1800
MAX_CONCURRENT_REQUESTS=25
REQUEST_TIMEOUT=45000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Database Configuration (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_persona
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true

# Security Configuration
API_KEY_ROTATION_INTERVAL=604800
ENABLE_ANALYTICS=true
ANALYTICS_SAMPLE_RATE=0.1
```

### Advanced Configuration Options

**Custom Analysis Categories**
```typescript
// In WalletPersonaService.ts
export const WALLET_CATEGORIES = {
  // DeFi Categories
  DEFI_POWER_USER: 'DeFi Power User',
  YIELD_FARMER: 'Yield Farmer',
  LIQUIDITY_PROVIDER: 'Liquidity Provider',
  
  // NFT Categories
  NFT_WHALE: 'NFT Whale',
  NFT_FLIPPER: 'NFT Flipper',
  PFPNFT_COLLECTOR: 'PFP NFT Collector',
  
  // Trading Categories
  MEV_SEARCHER: 'MEV Searcher',
  ARBITRAGEUR: 'Arbitrageur',
  SWING_TRADER: 'Swing Trader',
  
  // Governance Categories
  DAO_GOVERNANCE_PARTICIPANT: 'DAO Governance Participant',
  PROTOCOL_CONTRIBUTOR: 'Protocol Contributor',
  
  // Custom Categories
  INSTITUTIONAL_TRADER: 'Institutional Trader',
  CROSS_CHAIN_NATIVE: 'Cross-Chain Native'
};

// Custom category detection logic
private detectCustomCategories(walletDetails: WalletDetails): string[] {
  const categories: string[] = [];
  
  // Institutional trader detection
  if (this.isInstitutionalTrader(walletDetails)) {
    categories.push(WALLET_CATEGORIES.INSTITUTIONAL_TRADER);
  }
  
  // Cross-chain native detection
  if (this.isCrossChainNative(walletDetails)) {
    categories.push(WALLET_CATEGORIES.CROSS_CHAIN_NATIVE);
  }
  
  return categories;
}
```

**Custom Risk Factors**
```typescript
// Extend risk assessment framework
interface CustomRiskFactors {
  protocolConcentrationRisk: number;
  newProtocolExposure: number;
  governanceTokenVolatility: number;
  crossChainBridgeRisk: number;
  liquidityProviderImpermanentLoss: number;
}

// Implementation
private calculateCustomRiskFactors(walletDetails: WalletDetails): CustomRiskFactors {
  return {
    protocolConcentrationRisk: this.calculateProtocolConcentration(walletDetails.defiSummary),
    newProtocolExposure: this.assessNewProtocolRisk(walletDetails.transactions),
    governanceTokenVolatility: this.analyzeGovernanceTokenRisk(walletDetails.tokens),
    crossChainBridgeRisk: this.evaluateBridgeActivity(walletDetails.transactions),
    liquidityProviderImpermanentLoss: this.estimateImpermanentLossRisk(walletDetails.defiSummary)
  };
}
```

---

## Testing

### Comprehensive Testing Strategy

**Sample Wallet Addresses for Different Persona Types**

```typescript
export const TEST_WALLETS = {
  // DeFi Power Users
  VITALIK_BUTERIN: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  DEFI_WHALE: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
  
  // NFT Collectors (Great for testing NFT recommendations)
  PRANKSY: '0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459',
  NFT_FLIPPER: '0x54be3a794282c030b15e43ae2bb182e14c409c5e',
  WHALE_COLLECTOR: '0x2e675eeae4747c248bfddbafaa3a8a2fdddaa44b',
  BLUE_CHIP_COLLECTOR: '0xc6b0562605d35ee710138402b878ffe6f2e23807',
  
  // Active Traders
  MEV_BOT: '0x0000000000007F150Bd6f54c40A34d7C3d5e9f56',
  ARBITRAGE_BOT: '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
  
  // Long-term Holders
  HODLER: '0x742d35Cc6634C0532925a3b8D400d4E7D4D40000',
  ACCUMULATOR: '0x8315177aB297bA92A06054cE80a67Ed4DBd7Ed3a',
  
  // DAO Participants
  DAO_MEMBER: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
  GOVERNANCE_WHALE: '0x1a9c8182c09f50c8318d769245bea52c32be35bc',
  
  // Mixed Profile (Good for comprehensive testing)
  DIVERSE_TRADER: '0x9c5083dd4838e120dbeac44c052179692aa5dac5'
};
```

**Automated Testing Suite**
```bash
# Run comprehensive test suite
npm test

# Run specific test categories
npm run test:unit          # Unit tests for individual services
npm run test:integration   # API endpoint integration tests
npm run test:e2e          # End-to-end frontend tests
npm run test:performance  # Performance and load testing

# Run tests with coverage reporting
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch
```

**Test Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

**Performance Testing**
```typescript
// Performance test example
describe('Wallet Analysis Performance', () => {
  test('should analyze wallet within 10 seconds', async () => {
    const startTime = Date.now();
    
    const result = await analyzeWallet(TEST_WALLETS.VITALIK_BUTERIN);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000); // 10 seconds
    expect(result.success).toBe(true);
  });
  
  test('should handle concurrent requests efficiently', async () => {
    const promises = Array(10).fill(null).map(() => 
      analyzeWallet(TEST_WALLETS.DEFI_WHALE)
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // 30 seconds for 10 concurrent requests
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

### Debug Configuration

**Development Debugging**
```env
# Enable detailed logging
DEBUG=true
LOG_LEVEL=debug
ENABLE_TRACE_LOGGING=true

# API debugging
LOG_API_REQUESTS=true
LOG_API_RESPONSES=true
MORALIS_DEBUG=true

# AI debugging
GEMINI_DEBUG=true
LOG_AI_PROMPTS=true
LOG_AI_RESPONSES=true
```

**Error Handling and Monitoring**
```typescript
// Enhanced error handling
export class WalletAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletAnalysisError';
  }
}

// Usage in services
try {
  const walletData = await this.moralisService.getWalletData(address);
} catch (error) {
  if (error.status === 429) {
    throw new WalletAnalysisError(
      'Rate limit exceeded',
      'RATE_LIMIT_ERROR',
      { retryAfter: error.headers['retry-after'] }
    );
  }
  throw new WalletAnalysisError(
    'Failed to fetch wallet data',
    'DATA_FETCH_ERROR',
    { originalError: error.message }
  );
}
```

---

## Deployment

### Production Deployment Options

**Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["npm", "start"]
```

**Docker Compose Configuration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  wallet-persona-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MORALIS_API_KEY=${MORALIS_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wallet_persona
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Cloud Deployment (AWS)**
```bash
# Deploy to AWS using CDK
npm install -g aws-cdk
cdk init app --language typescript
cdk deploy WalletPersonaStack

# Or using Terraform
terraform init
terraform plan
terraform apply
```

**Performance Optimization**
```typescript
// Implement caching layer
export class CacheService {
  private redis: Redis;
  
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetcher();
    await this.redis.setex(key, ttl, JSON.stringify(data));
    return data;
  }
}

// Usage in services
async getWalletDetails(address: string): Promise<WalletDetails> {
  const cacheKey = `wallet:${address}`;
  
  return this.cacheService.getOrSet(
    cacheKey,
    () => this.fetchWalletDetailsFromAPI(address),
    1800 // 30 minutes cache
  );
}
```

---

## Contributing

### Development Guidelines

**Code Standards**
- Use TypeScript strict mode for all new code
- Follow ESLint configuration with Prettier formatting
- Maintain minimum 80% test coverage for new features
- Document all public APIs with TSDoc comments
- Use conventional commit messages (feat, fix, docs, style, refactor, test, chore)

**Branch Strategy**
```bash
# Feature development
git checkout -b feature/enhance-risk-scoring
git commit -m "feat: add ML-based risk factor detection"
git push origin feature/enhance-risk-scoring

# Bug fixes
git checkout -b fix/rate-limit-handling
git commit -m "fix: improve API rate limit error handling"

# Documentation updates
git checkout -b docs/api-documentation
git commit -m "docs: add comprehensive API endpoint documentation"
```

**Pull Request Process**
1. **Fork the repository** and create a feature branch
2. **Implement changes** following coding standards
3. **Add comprehensive tests** for new functionality
4. **Update documentation** including README and API docs
5. **Run full test suite** and ensure all tests pass
6. **Submit pull request** with detailed description

**Issue Reporting Template**
```markdown
## Bug Report

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Analyze wallet address '0x...'
2. Navigate to Risk Assessment section
3. See error in console

**Expected behavior**
Risk score should be calculated and displayed.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Node.js version: [e.g. 16.14.0]
- API keys configured: [Yes/No]

**Additional context**
Add any other context about the problem here.
```

---

## Support

### Getting Help

**Documentation Resources**
- [Moralis API Documentation](https://docs.moralis.io/) - Comprehensive Web3 data API reference
- [Google Gemini AI Documentation](https://ai.google.dev/docs) - AI integration guidelines
- [React Documentation](https://react.dev/) - Frontend framework reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system documentation

**Community Support**
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Stack Overflow**: Use tag `
