const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

// Perplexity AI API Proxy
exports.askPerplexity = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to use this feature'
    );
  }

  const { message } = data;
  
  if (!message || typeof message !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Message is required and must be a string'
    );
  }

  try {
    // Make API call to Perplexity AI
    const perplexityResponse = await fetch("https://api.perplexity.ai/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${functions.config().perplexity.key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: message,
        context: "stock market, investment, finance, Profitaly features"
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
    }

    const result = await perplexityResponse.json();
    
    // Store in Firestore (optional)
    try {
      await admin.firestore().collection('users')
        .doc(context.auth.uid)
        .collection('chatHistory')
        .add({
          message,
          response: result.answer,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (firestoreError) {
      console.error('Error storing chat history:', firestoreError);
      // Continue even if storage fails
    }

    return { reply: result.answer };
  } catch (error) {
    console.error('Error querying Perplexity API:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get a response from the AI service'
    );
  }
});

// HTTP Endpoint (Alternative)
exports.askPerplexityHttp = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Verify Firebase ID token
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (tokenError) {
      console.error('Error verifying token:', tokenError);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { message, uid } = req.body;

    if (!message || !uid) {
      res.status(400).json({ error: 'Message and uid are required' });
      return;
    }

    // Call Perplexity API
    const perplexityResponse = await fetch("https://api.perplexity.ai/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${functions.config().perplexity.key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: message,
        context: "stock market, investment, finance, Profitaly features"
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
    }

    const result = await perplexityResponse.json();
    
    // Store in Firestore (optional)
    try {
      await admin.firestore().collection('users')
        .doc(uid)
        .collection('chatHistory')
        .add({
          message,
          response: result.answer,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (firestoreError) {
      console.error('Error storing chat history:', firestoreError);
      // Continue even if storage fails
    }

    res.json({ reply: result.answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}); 