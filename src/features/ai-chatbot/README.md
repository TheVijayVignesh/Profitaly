# Profitaly AI Chatbot

A floating AI assistant for the Profitaly platform, powered by Perplexity AI. This chatbot allows users to ask questions about stocks, financial terms, and platform features.

## Features

- Floating chat button at the bottom-right corner of the screen
- Expandable chat interface
- Natural language queries about stocks and investing
- Conversation history within a session
- Authentication-protected access
- Backend powered by Perplexity AI (via Firebase Functions)

## Installation

1. Make sure the frontend dependencies are installed:

```bash
npm install framer-motion
```

2. Set up the Firebase Functions for the backend (see `/functions/README.md` for details)

## Integration

The chatbot has been integrated into the application in `App.tsx`. It's loaded only for authenticated routes:

```tsx
<RequireAuth>
  <>
    <Layout withSidebar={true} />
    <Chatbot />
  </>
</RequireAuth>
```

## Component Structure

- `Chatbot`: Main component that wraps all others
- `ChatbotProvider`: Context provider for chatbot state
- `ChatButton`: Floating button at the bottom-right
- `ChatWindow`: Expandable chat interface
- `ChatMessage`: Individual message bubbles
- `ChatInput`: Input field for user queries

## Usage

Simply import and use the `Chatbot` component:

```tsx
import { Chatbot } from '@/features/ai-chatbot';

// In your component:
return (
  <div>
    <YourApp />
    <Chatbot />
  </div>
);
```

For advanced usage, you can access the chatbot context:

```tsx
import { useChatbot } from '@/features/ai-chatbot';

function YourComponent() {
  const { sendMessage, messages } = useChatbot();
  
  // Custom integration
  return <div>...</div>;
}
```

## Customization

- Modify the UI in the component files
- Adjust the mock responses for development in `ChatbotContext.tsx`
- Change the Perplexity API context in the Firebase Function

## Future Enhancements (Phase 2)

- Context awareness (detect current page/stock)
- Personalization based on user profile
- Quick-reply suggestion buttons
- Voice input support
- Mini chart embedding 