# Smart Advisor Feature

The Smart Advisor feature provides personalized investment recommendations based on the user's investment profile and preferences. It uses AI to analyze the user's risk tolerance, goals, and preferences to suggest suitable stocks.

## Features

- **Investment Profile Form**: Allows users to specify their investment preferences:
  - Risk Tolerance (Low, Moderate, High)
  - Primary Goal (Capital Preservation, Income, Growth, Speculation)
  - Investment Horizon (<1 year, 1–3 years, 3–7 years, 7+ years)
  - Sector Preferences (multi-select)
  - Geographic Focus (multi-select)

- **AI-Powered Recommendations**: Uses the Perplexity API to generate personalized stock recommendations based on the user's profile.

- **Real-Time Stock Data**: Fetches current price, charts, and key metrics for recommended stocks using Finnhub and Twelve Data APIs.

- **Interactive Stock Details**: Provides detailed views of recommended stocks with interactive charts, key metrics, and AI-generated explanations.

## Configuration

This feature requires several API keys to function properly. All keys are read from environment variables:

```
# API Keys
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
VITE_TWELVE_DATA_API_KEY=your_twelve_data_api_key
VITE_FINNHUB_API_KEY=your_finnhub_api_key
```

### How to obtain API keys:

1. **Perplexity API Key**: 
   - Sign up at [Perplexity AI](https://www.perplexity.ai/)
   - Navigate to your account settings to generate an API key

2. **Twelve Data API Key**:
   - Register at [Twelve Data](https://twelvedata.com/)
   - Create a new API key in your dashboard

3. **Finnhub API Key**:
   - Create an account at [Finnhub](https://finnhub.io/)
   - Generate an API key from your account dashboard

## Implementation Details

The Smart Advisor feature is implemented with the following components:

- `InvestmentProfileForm.tsx`: Form component for collecting user preferences
- `StockRecommendationCard.tsx`: Card component for displaying stock recommendations
- `StockDetailView.tsx`: Detailed view of a selected stock with chart and metrics
- `SmartAdvisorFeature.tsx`: Main component that integrates all the pieces
- `smartAdvisorService.ts`: Service for handling API calls and data processing
- `types.ts`: TypeScript interfaces and types for the feature

## Usage

The Smart Advisor feature is accessible from the main navigation menu. Users can:

1. Fill out their investment profile
2. Submit the form to generate AI recommendations
3. View recommendations in a card layout
4. Click on a stock to see detailed information and analysis

## Fallback Mechanism

If any API calls fail, the feature includes fallback mechanisms to provide mock data, ensuring a smooth user experience even when external services are unavailable.
