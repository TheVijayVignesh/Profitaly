import React from 'react';
import { ChatMessage as MessageType } from '../contexts/ChatbotContext';
import { BotIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';
  
  return (
    <div className={cn(
      "flex w-full my-3", 
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex gap-3 max-w-[90%]", 
        isBot ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center shadow-sm",
          isBot 
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
            : "bg-blue-600 text-white"
        )}>
          {isBot ? (
            <BotIcon className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>
        
        <div className={cn(
          "py-3 px-4 rounded-2xl shadow-sm leading-relaxed text-base",
          isBot 
            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
            : "bg-blue-600 text-white"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 