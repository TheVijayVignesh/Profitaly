import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Define message types
export type MessageType = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

interface ChatbotContextProps {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (content: string, type: MessageType) => void;
  clearMessages: () => void;
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  closeChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextProps | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentUser } = useAuth();

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Add a message to the chat
  const addMessage = (content: string, type: MessageType) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      content,
      type,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  // Close chat
  const closeChat = () => {
    setIsOpen(false);
  };

  // Send message to Perplexity AI via Firebase Function
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(message, 'user');
    setIsLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('You need to be logged in to use the chatbot');
      }
      
      // Call Firebase function
      const askPerplexity = httpsCallable(functions, 'askPerplexity');
      const result = await askPerplexity({ message });
      
      // Add bot response
      const data = result.data as { reply: string };
      addMessage(data.reply, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Oops! Something went wrong. Try again later.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  // For development/testing without API
  const mockSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(message, 'user');
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses based on keywords
    let response: string;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('stock') || lowerMessage.includes('invest')) {
      response = "Stocks are ownership shares in a company. Investing in them gives you a chance to grow your wealth over time as the company grows. Consider your risk tolerance and time horizon before investing.";
    } else if (lowerMessage.includes('tcs') || lowerMessage.includes('infosys')) {
      response = "Both TCS and Infosys are leading Indian IT companies. TCS tends to offer more stability while Infosys may show higher short-term volatility. Your investment choice should depend on your risk appetite and investment timeline.";
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('diversify')) {
      response = "Diversification is key to reducing risk. A balanced portfolio typically includes a mix of stocks, bonds, and other assets across different sectors and geographies.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how to')) {
      response = "I can help you understand financial concepts, analyze stocks, and navigate the Profitaly platform. Just ask me specific questions about investing or how to use features!";
    } else {
      response = "I'm your Profitaly AI Assistant. I can help with questions about stocks, investing, financial terms, or how to use the platform. What would you like to know?";
    }
    
    // Add bot response
    addMessage(response, 'bot');
    setIsLoading(false);
  };

  // Always use the mock function for now
  // const handleSendMessage = import.meta.env.DEV ? mockSendMessage : sendMessage;
  const handleSendMessage = mockSendMessage;

  const value = {
    messages,
    isOpen,
    isLoading,
    addMessage,
    clearMessages,
    sendMessage: handleSendMessage,
    toggleChat,
    closeChat
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider; 