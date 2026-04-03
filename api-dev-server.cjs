const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoints to verify API structure
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is running!', timestamp: new Date().toISOString() });
});

// Mock user endpoint for testing
app.post('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { email, displayName } = req.body;
  
  res.json({
    id,
    email: email || 'test@example.com',
    displayName: displayName || 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    id,
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Mock portfolio endpoints
app.get('/api/portfolios', (req, res) => {
  res.json([
    {
      id: 'test-portfolio-1',
      userId: req.headers['x-user-id'] || 'demo-user',
      name: 'Trial Room - NSE',
      cashBalance: '10000.00',
      totalValue: '10500.00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/portfolios', (req, res) => {
  const { name, cashBalance } = req.body;
  
  const newPortfolio = {
    id: 'test-portfolio-' + Date.now(),
    userId: req.headers['x-user-id'] || 'demo-user',
    name: name || 'Test Portfolio',
    cashBalance: cashBalance || '10000.00',
    totalValue: '10000.00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(newPortfolio);
});

// Mock holdings endpoints
app.get('/api/holdings', (req, res) => {
  const { portfolioId } = req.query;
  
  res.json([
    {
      id: 'test-holding-1',
      portfolioId: portfolioId || 'test-portfolio-1',
      userId: req.headers['x-user-id'] || 'demo-user',
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Ltd',
      quantity: '10.000000',
      averageCost: '2500.0000',
      exchange: 'NSE',
      updatedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/holdings', (req, res) => {
  const { portfolioId, symbol, quantity, averageCost } = req.body;
  
  const newHolding = {
    id: 'test-holding-' + Date.now(),
    portfolioId: portfolioId || 'test-portfolio-1',
    userId: req.headers['x-user-id'] || 'demo-user',
    symbol: symbol || 'TEST',
    companyName: symbol || 'Test Company',
    quantity: quantity || '10.000000',
    averageCost: averageCost || '100.0000',
    exchange: 'NSE',
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(newHolding);
});

// Mock transactions endpoints
app.get('/api/transactions', (req, res) => {
  const { portfolioId } = req.query;
  
  res.json([
    {
      id: 'test-transaction-1',
      userId: req.headers['x-user-id'] || 'demo-user',
      portfolioId: portfolioId || 'test-portfolio-1',
      symbol: 'RELIANCE',
      type: 'BUY',
      quantity: '10.000000',
      price: '2500.0000',
      total: '25000.00',
      exchange: 'NSE',
      executedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/transactions', (req, res) => {
  const { portfolioId, symbol, type, quantity, price, total } = req.body;
  
  const newTransaction = {
    id: 'test-transaction-' + Date.now(),
    userId: req.headers['x-user-id'] || 'demo-user',
    portfolioId: portfolioId || 'test-portfolio-1',
    symbol: symbol || 'TEST',
    type: type || 'BUY',
    quantity: quantity || '10.000000',
    price: price || '100.0000',
    total: total || '1000.00',
    exchange: 'NSE',
    executedAt: new Date().toISOString()
  };
  
  res.status(201).json(newTransaction);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📁 API routes available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend should be available at http://localhost:8080`);
  console.log(`🧪 Test the API at http://localhost:${PORT}/api/test`);
});
