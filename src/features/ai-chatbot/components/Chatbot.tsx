import React from 'react';
import { ChatbotProvider } from '../contexts/ChatbotContext';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const Chatbot: React.FC = () => {
  return (
    <ChatbotProvider>
      <ChatButton />
      <ChatWindow />
    </ChatbotProvider>
  );
};

export default Chatbot; 