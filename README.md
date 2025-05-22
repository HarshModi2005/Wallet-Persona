# Wallet Persona Analyzer

A blockchain wallet analysis tool that generates detailed on-chain "personas" for Ethereum wallet addresses.

## Features

- Wallet category identification (NFT Collector, DeFi Investor, Trader, etc.)
- Risk assessment scores
- Activity metrics and visualizations
- Asset distribution analysis
- Personalized recommendations
- AI-generated wallet bios

## NEW: AI-Enhanced Analysis with Gemini

This project now features Gemini AI integration for more sophisticated wallet analysis, providing:

- More accurate trading behavior assessment
- Detailed risk factor identification
- Personalized token recommendations based on wallet activity
- AI-generated wallet bios that capture on-chain persona
- Contextual dApp recommendations

For setup instructions, see [GEMINI_SETUP.md](./GEMINI_SETUP.md)

## Project Structure

This project consists of two parts:
1. Backend API (Express + TypeScript)
2. Frontend (React + TypeScript)

## Setup Instructions

### Backend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```
   MORALIS_API_KEY=your_moralis_api_key_here
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here  # Optional, for AI features
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd wallet-persona-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to http://localhost:3000

## Usage

1. Enter an Ethereum wallet address in the search bar
2. Click "Analyze Wallet"
3. View the detailed persona information, including:
   - Wallet profile
   - Categories & tags
   - Risk assessment
   - Activity metrics
   - Asset distribution
   - Personalized recommendations

## Technologies Used

- **Backend**:
  - Express.js
  - TypeScript
  - Moralis API
  - Ethereum RPC
  - Google Gemini AI API

- **Frontend**:
  - React.js
  - JavaScript
  - Bootstrap/React-Bootstrap
  - Chart.js for visualizations
  - FontAwesome for icons

## License

MIT 