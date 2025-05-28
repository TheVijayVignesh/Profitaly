import React, { useRef, useEffect } from 'react';
import { XIcon, Trash2Icon } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow: React.FC = () => {
  const { messages, isOpen, closeChat, clearMessages } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        content: "👋 Hi! I'm your Profitaly AI Assistant. I can help you with questions about stocks, investing, or how to use the platform. What would you like to know?",
        type: 'bot' as const,
        timestamp: new Date()
      };
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-8 w-96 max-h-[75vh] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl flex flex-col z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profitaly AI Assistant</h3>
          <div className="flex gap-1">
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Clear chat"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost" 
              size="icon" 
              onClick={closeChat}
              className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {messages.length === 0 && (
            <ChatMessage
              message={{
                id: 'welcome',
                content: "👋 Hi! I'm your Profitaly AI Assistant. I can help you with questions about stocks, investing, or how to use the platform. What would you like to know?",
                type: 'bot',
                timestamp: new Date()
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <ChatInput />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatWindow; 