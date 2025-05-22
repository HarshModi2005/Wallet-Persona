# Wallet Persona Analyzer

A blockchain wallet analysis tool that generates detailed on-chain "personas" for Ethereum wallet addresses.

## Features

- Wallet category identification (NFT Collector, DeFi Investor, Trader, etc.)
- Risk assessment scores
- Activity metrics and visualizations
- Asset distribution analysis
- Personalized recommendations
- AI-generated wallet bios

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

- **Frontend**:
  - React.js
  - TypeScript
  - Bootstrap/React-Bootstrap
  - Chart.js for visualizations
  - React Icons

## License

MIT 