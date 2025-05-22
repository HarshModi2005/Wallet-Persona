# Setting Up Gemini AI for Enhanced Wallet Analysis

The Wallet Persona application now supports enhanced wallet analysis using Google's Gemini AI. This provides more accurate and detailed wallet personas, including better:

- Trading behavior analysis
- Risk assessment
- Personalized token recommendations
- dApp suggestions
- Wallet personality bios

## Getting a Gemini API Key

1. Visit the [Google AI Studio](https://aistudio.google.com/) and sign in with your Google account
2. Navigate to "API Keys" in the left sidebar
3. Click "Create API Key"
4. Copy your new API key

## Adding the API Key to Your Project

Add the Gemini API key to your project by:

1. Open the `.env` file in the project root
2. Add or modify the `GEMINI_API_KEY` line:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Save the file and restart the application

## Testing the AI Enhancement

With the API key properly configured:

1. Run the application using `./start-dev.sh`
2. Enter an Ethereum wallet address
3. The analysis will now include AI-enhanced:
   - More accurate risk assessment
   - Personalized token recommendations
   - AI-generated wallet bio
   - Tailored dApp suggestions

## Gemini AI Features

The integration uses Gemini for:

1. **Wallet Analysis**: Examines transaction patterns to determine trading behavior and activity level
2. **Risk Assessment**: Calculates risk factors and provides a detailed risk score
3. **Bio Generation**: Creates a personalized description of the wallet's on-chain persona
4. **Asset Recommendations**: Suggests tokens and dApps based on past behavior

## Troubleshooting

If you encounter any issues:

- Check that the `.env` file contains the correct API key
- Verify that you have an active internet connection
- Ensure you're using a valid Gemini API key
- Check console logs for any specific error messages

The application will fall back to default analysis methods if the Gemini API is unavailable or not configured properly. 