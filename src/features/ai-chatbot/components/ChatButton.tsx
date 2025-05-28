import React from 'react';
import { BotIcon } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ChatButton: React.FC = () => {
  const { toggleChat, isOpen } = useChatbot();

  return (
    <motion.div 
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Button
        onClick={toggleChat}
        size="lg"
        className="h-16 w-16 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <BotIcon className="h-7 w-7" strokeWidth={2.5} />
      </Button>
    </motion.div>
  );
};

export default ChatButton; 