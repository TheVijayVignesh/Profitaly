import { aiInsightService } from "./aiInsightService";
import { newsApiService } from "./newsApiService";
import { trialRoomService } from "./trialRoomService";
import { twelveDataService } from "./twelveDataService";
import { finnhubService } from "./finnhubService";

// Perplexity API key from environment variable
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';

interface UserData {
  holdings?: Array<{
    quantity: number;
    avg_price: number;
  }>;
  cash_left?: number;
  total_value?: number;
}

/**
 * Enhanced Chatbot Service
 * Provides a more conversational and helpful chatbot experience
 */
class ChatbotService {
  private systemPrompt = `You are a friendly and helpful financial assistant for ProfitAly, a stock trading platform.
  
  Follow these guidelines:
  1. Be warm and conversational in your responses
  2. Acknowledge user requests with phrases like "Sure thing!" or "I'd be happy to help with that"
  3. End responses with a follow-up question or offer for additional assistance when appropriate
  4. If you can't fulfill a request, apologize clearly and suggest what you CAN do instead
  5. Keep responses concise but informative
  
  You can help with:
  - Searching for stocks and providing basic information
  - Viewing user portfolio and holdings
  - Providing AI-powered insights on stocks
  - Finding recent news about companies
  - Explaining financial terms and concepts
  
  Always maintain a positive, encouraging tone while providing accurate information.`;

  /**
   * Process a user message and generate a response
   * @param message User's message
   * @param userData User's trial room data (if available)
   */
  async processMessage(message: string, userData?: UserData) {
    try {
      // Check if we're asking about a specific stock
      const stockSymbolMatch = message.match(/\b[A-Z]{1,5}\b/g);
      const lowerMessage = message.toLowerCase();
      
      // Greeting patterns
      if (this.isGreeting(lowerMessage)) {
        return this.generateGreetingResponse();
      }
      
      // Check for specific question types
      if (lowerMessage.includes("about stocks") || lowerMessage.includes("what are stocks") || 
          lowerMessage.includes("explain stocks") || lowerMessage.match(/\bstocks\b/) && lowerMessage.includes("?")
      ) {
        return this.generateStockExplanationResponse();
      }
      
      // Trial room usage questions
      if (lowerMessage.includes("trial room") || lowerMessage.includes("how to use") || 
          lowerMessage.includes("how do i") && (lowerMessage.includes("trade") || lowerMessage.includes("buy") || lowerMessage.includes("sell"))
      ) {
        return this.generateTrialRoomGuideResponse();
      }
      
      // Stock recommendation questions
      if (lowerMessage.includes("good idea") || lowerMessage.includes("should i buy") || 
          lowerMessage.includes("should i invest") || lowerMessage.includes("worth buying")
      ) {
        if (stockSymbolMatch && stockSymbolMatch.length > 0) {
          return this.generateInvestmentAdviceResponse(stockSymbolMatch[0]);
        } else {
          return "I'd be happy to help you evaluate an investment! Could you tell me which specific stock you're considering? For example, you could ask about AAPL (Apple) or MSFT (Microsoft).";
        }
      }
      
      // Standard intents
      if (lowerMessage.includes("portfolio") || lowerMessage.includes("holdings") || lowerMessage.includes("my stocks")) {
        return this.generatePortfolioResponse(userData);
      } else if (lowerMessage.includes("search") || lowerMessage.includes("find stock") || lowerMessage.includes("look up")) {
        return this.generateSearchResponse(message);
      } else if (stockSymbolMatch && stockSymbolMatch.length > 0) {
        return this.generateStockInfoResponse(stockSymbolMatch[0]);
      } else if (lowerMessage.includes("news") || lowerMessage.includes("headlines") || lowerMessage.includes("articles")) {
        return this.generateNewsResponse(message);
      } else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do") || lowerMessage.includes("features")) {
        return this.generateHelpResponse();
      } else {
        return this.generateGenericResponse(message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      return "I'm sorry, I encountered an error while processing your request. How else can I assist you today?";
    }
  }
  
  /**
   * Check if a message is a greeting
   */
  private isGreeting(message: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    return greetings.some(greeting => message.includes(greeting));
  }
  
  /**
   * Generate a friendly greeting response
   */
  private generateGreetingResponse(): string {
    const greetings = [
      "Hello there! I'm your ProfitAly assistant. How can I help with your investment journey today?",
      "Hi! Welcome to ProfitAly. I'm here to help you navigate the world of investing. What would you like to know?",
      "Hey! I'm your financial assistant. Whether you're looking for stock info, portfolio advice, or market news, I'm here to help!",
      "Greetings! I'm your ProfitAly AI assistant. Ready to explore stocks, check your portfolio, or learn about investing?"
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  /**
   * Generate an explanation about stocks
   */
  private generateStockExplanationResponse(): string {
    return "Stocks represent ownership shares in a company. When you buy a stock, you're purchasing a small piece of that business and become a shareholder.\n\nInvesting in stocks gives you the opportunity to grow your wealth as the company grows and becomes more valuable. Companies may also share profits with shareholders through dividends.\n\nHowever, stocks come with risks—their value can fluctuate based on company performance, economic conditions, and market sentiment. It's important to consider your financial goals, risk tolerance, and investment timeline before investing.\n\nWould you like me to help you explore specific stocks or explain more about investment strategies?";
  }
  
  /**
   * Generate a guide on how to use the Trial Room
   */
  private generateTrialRoomGuideResponse(): string {
    return "The Trial Room is a safe space to practice stock trading with virtual money. Here's how to use it:\n\n1. **Search for Stocks**: Use the search bar at the top to find stocks you're interested in.\n\n2. **View Stock Details**: Click on a stock to see detailed information, news, and AI-powered insights.\n\n3. **Buy Stocks**: Click the 'Buy' button and enter the quantity you want to purchase.\n\n4. **Track Your Portfolio**: View your holdings, performance, and transaction history in the respective tabs.\n\n5. **Sell Stocks**: When you're ready to sell, find the stock in your portfolio and click 'Sell'.\n\nYou start with $10,000 in virtual cash, so you can experiment without risking real money. Would you like me to help you find a specific stock to start with?";
  }
  
  /**
   * Generate investment advice for a specific stock
   */
  private generateInvestmentAdviceResponse(symbol: string): string {
    return `I appreciate your interest in ${symbol}, but I should clarify that I can't provide personalized investment advice. Investment decisions should be based on your financial situation, goals, and risk tolerance.\n\nWhat I can offer is factual information about ${symbol}, including recent performance, news, and analyst insights. Would you like me to show you this information to help inform your decision?\n\nAlternatively, you can use our Trial Room to practice trading ${symbol} with virtual money before making real investment decisions.`;
  }

  /**
   * Generate a response about the user's portfolio
   */
  private async generatePortfolioResponse(userData: UserData) {
    if (!userData || !userData.holdings || userData.holdings.length === 0) {
      return "I don't see any holdings in your portfolio yet. Would you like to search for stocks to start building your portfolio?";
    }

    const holdingsCount = userData.holdings.length;
    const totalValue = userData.holdings.reduce((total: number, holding: any) => {
      return total + (holding.quantity * holding.avg_price);
    }, 0);
    const cashLeft = userData.cash_left || 0;

    return `Sure thing! Here's a summary of your portfolio:
    
You currently have ${holdingsCount} stock${holdingsCount !== 1 ? 's' : ''} in your portfolio with a total value of approximately $${totalValue.toFixed(2)}.
Your remaining cash balance is $${cashLeft.toFixed(2)}.

Would you like me to provide more details about a specific holding or help you find new investment opportunities?`;
  }

  /**
   * Generate a response for stock search
   */
  private async generateSearchResponse(message: string) {
    // Extract potential stock name or keyword from message
    const searchTerms = message.replace(/search for|find|stock|about/gi, '').trim();
    
    if (!searchTerms) {
      return "I'd be happy to help you search for stocks! Could you tell me which company or sector you're interested in?";
    }

    try {
      // Try to search for the stock
      const results = await twelveDataService.searchSymbols(searchTerms)
        .catch(() => finnhubService.searchSymbols(searchTerms))
        .catch(() => []);
      
      if (results.length === 0) {
        return `I couldn't find any stocks matching "${searchTerms}". Could you try with a different company name or ticker symbol?`;
      }

      // Limit to top 3 results for a cleaner response
      const topResults = results.slice(0, 3);
      const resultsList = topResults.map((stock: any) => `- ${stock.symbol}: ${stock.name} (${stock.exchange})`).join('\\n');
      
      return `I found these stocks matching "${searchTerms}":
      
${resultsList}

You can click on any of these in the Trial Room to see more details. Would you like me to search for something else?`;
    } catch (error) {
      console.error("Error searching for stocks:", error);
      return `I'm sorry, I had trouble searching for "${searchTerms}". Please try again with a company name or ticker symbol.`;
    }
  }

  /**
   * Generate information about a specific stock
   */
  private async generateStockInfoResponse(symbol: string) {
    try {
      // Try to get stock price
      const priceData = await twelveDataService.getPrice(symbol)
        .catch(() => ({ price: null }));
      
      // Get AI insight
      let insightText = "";
      try {
        const stockData = await twelveDataService.searchSymbols(symbol);
        if (stockData && stockData.length > 0) {
          const stock = stockData[0];
          const price = priceData.price || Math.floor(50 + Math.random() * 950);
          const insight = await aiInsightService.getStockInsight(symbol, stock.name, price);
          insightText = `\\n\\nHere's my analysis: ${insight.analysis}`;
        }
      } catch (error) {
        console.error("Error getting AI insight:", error);
        insightText = "";
      }
      
      // Get recent news
      let newsText = "";
      try {
        const newsData = await newsApiService.getStockNews(symbol, undefined, 2);
        if (newsData && newsData.length > 0) {
          const newsItems = newsData.map((item: any) => `- ${item.title} (${item.source})`).join('\\n');
          newsText = `\\n\\nRecent news:\\n${newsItems}`;
        }
      } catch (error) {
        console.error("Error getting news:", error);
        newsText = "";
      }
      
      const price = priceData.price ? `$${priceData.price.toFixed(2)}` : "price information unavailable";
      
      return `Here's what I found about ${symbol}:
      
Current price: ${price}${insightText}${newsText}

Would you like to see more detailed information or search for a different stock?`;
    } catch (error) {
      console.error("Error getting stock info:", error);
      return `I'm sorry, I couldn't find information for ${symbol}. Is there another stock you'd like to know about?`;
    }
  }

  /**
   * Generate a response about news
   */
  private async generateNewsResponse(message: string) {
    // Extract potential stock symbol from message
    const stockMatch = message.match(/\b[A-Z]{1,5}\b/g);
    const stockSymbol = stockMatch ? stockMatch[0] : null;
    
    if (!stockSymbol) {
      return "I'd be happy to find news for you! Could you specify which company or stock symbol you're interested in?";
    }
    
    try {
      const newsData = await newsApiService.getStockNews(stockSymbol, undefined, 3);
      
      if (!newsData || newsData.length === 0) {
        return `I couldn't find any recent news for ${stockSymbol}. Would you like to try another stock symbol?`;
      }
      
      const newsItems = newsData.map((item: any, index: number) => 
        `${index + 1}. ${item.title} (${item.source})`
      ).join('\\n');
      
      return `Here are the latest headlines for ${stockSymbol}:
      
${newsItems}

Would you like me to search for news about another company or help with something else?`;
    } catch (error) {
      console.error("Error getting news:", error);
      return `I'm sorry, I had trouble finding news for ${stockSymbol}. Is there something else I can help you with?`;
    }
  }

  /**
   * Generate a help response
   */
  private generateHelpResponse() {
    return `I'd be happy to help! Here's what I can do for you:

1. Search for stocks by name or symbol
2. Show details about your portfolio and holdings
3. Provide AI-powered insights on specific stocks
4. Find recent news about companies
5. Explain financial terms and concepts

Just let me know what you're interested in, and I'll do my best to assist you. What would you like to explore first?`;
  }

  /**
   * Generate a generic response using the Perplexity API or fallback
   */
  private async generateGenericResponse(message: string) {
    // If no API key or in development, use fallback responses
    if (!PERPLEXITY_API_KEY || import.meta.env.DEV) {
      return this.generateFallbackResponse(message);
    }
    
    try {
      // Implement actual API call to Perplexity here if needed
      // For now, use fallback responses
      return this.generateFallbackResponse(message);
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I'm having trouble understanding that request. Would you like to know about your portfolio, search for stocks, or get the latest market news?";
    }
  }

  /**
   * Generate a fallback response when we can't understand the user's intent
   */
  private generateFallbackResponse(message: string) {
    const fallbackResponses = [
      "I'm not sure I understand what you're asking. Would you like to view your portfolio, search for stocks, or get some market news?",
      "I'd love to help, but I'm not sure what you're looking for. You can ask me about specific stocks, your portfolio, or the latest market news.",
      "I'm sorry, I don't have that capability yet. I can help you search for stocks, view your portfolio, or get AI insights on specific companies.",
      "I'm still learning! Right now, I can help with searching stocks, viewing your portfolio, and getting news about companies. What would you like to do?",
      "I'm not able to do that at the moment. Would you like to search for a stock, check your portfolio, or get some market insights instead?"
    ];
    
    // Select a random fallback response
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
