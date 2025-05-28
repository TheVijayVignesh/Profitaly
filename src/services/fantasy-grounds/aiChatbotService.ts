import { Competition, Portfolio } from '@/types/fantasy-grounds';

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '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';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get AI response for user query in Fantasy Grounds context
 */
export const getAIResponse = async (
  query: string, 
  userName: string,
  activeCompetition?: Competition | null,
  portfolio?: Portfolio | null
): Promise<string> => {
  try {
    // Construct context-aware system prompt
    let systemPrompt = `You are an AI investment advisor in the ProfitAly Fantasy Grounds stock market competition platform. 
Your name is ProfitAly AI and you're speaking with ${userName}. 
Be friendly, concise, and provide actionable investment advice based on current market trends.`;

    // Add competition context if available
    if (activeCompetition) {
      systemPrompt += `\n\n${userName} is currently participating in a competition called "${activeCompetition.title}" 
which focuses on the ${activeCompetition.marketRegion} market. 
The competition started on ${activeCompetition.startTime.toLocaleDateString()} 
and will end on ${activeCompetition.endTime.toLocaleDateString()}.`;
    }

    // Add portfolio context if available
    if (portfolio) {
      systemPrompt += `\n\n${userName}'s current portfolio value is $${portfolio.totalValue.toFixed(2)} 
with a wallet balance of $${portfolio.walletBalance.toFixed(2)} and an ROI of ${portfolio.roi.toFixed(2)}%. 
They currently have ${portfolio.positions.length} different stocks in their portfolio.`;

      if (portfolio.positions.length > 0) {
        systemPrompt += `\n\nTheir top holdings are: ${portfolio.positions
          .sort((a, b) => b.currentValue - a.currentValue)
          .slice(0, 3)
          .map(p => `${p.symbol} (${p.quantity} shares, $${p.currentValue.toFixed(2)})`)
          .join(', ')}.`;
      }
    }

    // Prepare messages for the API
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: query
      }
    ];

    // Call Perplexity API
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-small-32k-online',
        messages,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return `I'm sorry, I couldn't process your request at the moment. Please try again later.`;
  }
};
