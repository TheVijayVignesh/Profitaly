import React, { useState, FormEvent } from 'react';
import { SendIcon, Loader2 } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatInput: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const { sendMessage, isLoading } = useChatbot();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || isLoading) return;
    
    // Send message and clear input
    await sendMessage(userInput);
    setUserInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Ask about stocks, investing, features..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        disabled={isLoading}
        className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus-visible:ring-blue-500 pl-4 py-6 text-base text-gray-900 dark:text-gray-100"
      />
      <Button 
        type="submit" 
        size="icon"
        className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={!userInput.trim() || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendIcon className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
};

export default ChatInput; 