import axios from 'axios';

// Base URL for NewsAPI
const NEWS_API_URL = 'https://newsapi.org/v2';

// API key from environment variable
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// Development mode flag
const IS_DEV = import.meta.env.DEV;

// Log to help debug
console.log(`NewsAPI: ${NEWS_API_KEY ? 'API key is set' : 'API key is NOT set'}`);

/**
 * NewsAPI Service
 */
class NewsApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: NEWS_API_URL,
      params: {
        apiKey: NEWS_API_KEY
      },
      timeout: 10000 // 10 seconds timeout
    });
  }

  /**
   * Get news articles for a specific stock
   * @param symbol Stock symbol (e.g., AAPL)
   * @param company Company name for better search results
   * @param count Number of articles to return
   */
  async getStockNews(symbol: string, company?: string, count: number = 5) {
    try {
      // Use both symbol and company name for better results if available
      const query = company ? `${symbol} OR "${company}"` : symbol;
      
      // If in development or no API key, return mock data
      if (IS_DEV || !NEWS_API_KEY) {
        console.log(`Using mock news data for ${symbol}`);
        return this.getMockNews(symbol, company, count);
      }
      
      const response = await this.axiosInstance.get('/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: count
        }
      });
      
      if (response.data && response.data.articles && response.data.articles.length > 0) {
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage
        }));
      } else {
        console.warn(`No news found for ${symbol}, using mock data`);
        return this.getMockNews(symbol, company, count);
      }
    } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      return this.getMockNews(symbol, company, count);
    }
  }
  
  /**
   * Generate mock news for testing
   */
  private getMockNews(symbol: string, company?: string, count: number = 5) {
    const companyName = company || symbol;
    const news = [];
    const sources = ['Market Watch', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
    const topics = [
      'quarterly results', 'new product announcement', 'management changes', 
      'market expansion', 'strategic partnership', 'industry trends'
    ];
    
    for (let i = 0; i < count; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const daysAgo = i;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      news.push({
        title: `${companyName} announces ${topic}`,
        description: `${companyName} has recently published information regarding ${topic}. This could potentially impact the company's performance in the coming quarters.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-${topic.replace(/\s+/g, '-')}`,
        source: source,
        publishedAt: date.toISOString(),
        urlToImage: `https://via.placeholder.com/640x360.png?text=${symbol}`
      });
    }
    
    return news;
  }
}

export const newsApiService = new NewsApiService();
export default newsApiService;
