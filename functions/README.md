# Profitaly AI Chatbot - Firebase Functions

This directory contains the Firebase Cloud Functions that power the AI Chatbot in Profitaly.

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Set up Perplexity API Key

You need to set up your Perplexity API key in Firebase Functions config:

```bash
firebase functions:config:set perplexity.key="YOUR_PERPLEXITY_API_KEY"
```

### 3. Deploy Functions

```bash
firebase deploy --only functions
```

## Available Functions

- `askPerplexity`: Callable function that sends user queries to Perplexity AI.
- `askPerplexityHttp`: HTTP endpoint (alternative approach).

## Function Usage

Both functions require authentication. The callable function automatically handles user authentication, while the HTTP endpoint requires a valid Firebase ID token in the Authorization header.

### Callable Function Example (Frontend)

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const askPerplexity = httpsCallable(functions, 'askPerplexity');
const result = await askPerplexity({ message: 'What is a blue chip stock?' });
console.log(result.data.reply);
```

### HTTP Endpoint Example (Frontend)

```typescript
const token = await currentUser.getIdToken();
const response = await fetch('/api/ask-perplexity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'What is a blue chip stock?',
    uid: currentUser.uid
  })
});
const data = await response.json();
console.log(data.reply);
```

## Chat History

By default, chat history is stored in Firestore under:

```
users/{uid}/chatHistory/{chatId}
```

Each chat entry contains:
- `message`: User's query
- `response`: AI's response
- `timestamp`: Server timestamp when the message was processed 