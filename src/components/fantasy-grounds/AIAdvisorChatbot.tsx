import React, { useState, useRef, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Competition, Portfolio } from '@/types/fantasy-grounds';
import { getAIResponse } from '@/services/fantasy-grounds/aiChatbotService';
import { MessageCircle, Send, X, Minimize, Maximize, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIAdvisorChatbotProps {
  competition?: Competition | null;
  portfolio?: Portfolio | null;
}

const AIAdvisorChatbot: React.FC<AIAdvisorChatbotProps> = ({ 
  competition, 
  portfolio 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        content: `Hello${auth.currentUser?.displayName ? ` ${auth.currentUser.displayName}` : ''}! I'm your AI investment advisor. How can I help you with your stock market strategy today?`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const userName = auth.currentUser?.displayName || 'User';
      const aiResponse = await getAIResponse(input, userName, competition, portfolio);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Chatbot dialog */}
      {isOpen && (
        <div 
          className={`fixed ${isMinimized ? 'bottom-6 right-6 w-auto h-auto' : 'bottom-6 right-6 w-80 sm:w-96 h-[500px]'} z-50 transition-all duration-200 ease-in-out`}
        >
          <Card className="h-full flex flex-col shadow-xl border-primary/20">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
              <CardTitle className="text-base font-medium flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                AI Investment Advisor
              </CardTitle>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {!isMinimized && (
              <>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                        {message.sender === 'ai' && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/ai-advisor.png" alt="AI" />
                            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div 
                            className={`rounded-lg px-3 py-2 text-sm ${
                              message.sender === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div className={`text-xs text-muted-foreground mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                        {message.sender === 'user' && auth.currentUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            {auth.currentUser.photoURL ? (
                              <AvatarImage src={auth.currentUser.photoURL} alt={auth.currentUser.displayName || 'User'} />
                            ) : null}
                            <AvatarFallback>
                              {auth.currentUser.displayName 
                                ? auth.currentUser.displayName.charAt(0).toUpperCase() 
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex flex-row items-start gap-2 max-w-[80%]">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                
                <CardFooter className="p-3 border-t">
                  <div className="flex w-full items-center space-x-2">
                    <Input
                      placeholder="Ask about stocks or strategies..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage} 
                      disabled={isLoading || !input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default AIAdvisorChatbot;
