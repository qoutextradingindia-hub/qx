const express = require('express');
const router = express.Router();

// API Keys Storage (In production, use secure database)
let apiKeys = {
  binanceApiKey: '',
  binanceSecretKey: '',
  twelveDataApiKey: 'demo', // Free key available
  alphaVantageApiKey: 'demo',
  polygonApiKey: ''
};

// Get API Keys
router.get('/api-keys', async (req, res) => {
  try {
    res.json({
      success: true,
      keys: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API keys',
      error: error.message
    });
  }
});

// Save API Keys
router.post('/api-keys', async (req, res) => {
  try {
    apiKeys = { ...apiKeys, ...req.body };
    
    res.json({
      success: true,
      message: 'API keys saved successfully',
      keys: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving API keys',
      error: error.message
    });
  }
});

// Add Market
router.post('/markets', async (req, res) => {
  try {
    const { symbol, name, category, exchange, payoutPercent, minAmount, maxAmount, status } = req.body;
    
    // Check if market already exists
    const existingMarket = await req.app.locals.db.collection('markets').findOne({ symbol });
    if (existingMarket) {
      return res.status(400).json({
        success: false,
        message: 'Market with this symbol already exists'
      });
    }

    const market = {
      symbol,
      name,
      category,
      exchange,
      payoutPercent: payoutPercent || 87,
      minAmount: minAmount || 1,
      maxAmount: maxAmount || 1000,
      status: status || 'ACTIVE',
      currentPrice: 0,
      priceChange: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await req.app.locals.db.collection('markets').insertOne(market);
    
    res.json({
      success: true,
      message: 'Market added successfully',
      market: { ...market, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding market',
      error: error.message
    });
  }
});

// Delete Market
router.delete('/markets/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const marketId = req.params.id;
    
    const result = await req.app.locals.db.collection('markets')
      .deleteOne({ _id: new ObjectId(marketId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Market not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Market deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting market',
      error: error.message
    });
  }
});

// Get Market Statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMarkets = await req.app.locals.db.collection('markets').countDocuments();
    const activeMarkets = await req.app.locals.db.collection('markets')
      .countDocuments({ status: 'ACTIVE' });
    
    const categoryStats = await req.app.locals.db.collection('markets').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();

    const exchangeStats = await req.app.locals.db.collection('markets').aggregate([
      { $group: { _id: '$exchange', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({
      success: true,
      stats: {
        totalMarkets,
        activeMarkets,
        categoryStats,
        exchangeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Bulk Add Predefined Markets
router.post('/bulk-markets', async (req, res) => {
  try {
    const { category } = req.body;
    
    const marketTemplates = {
      crypto: [
        { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'ETHUSDT', name: 'Ethereum', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'BNBUSDT', name: 'BNB', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'ADAUSDT', name: 'Cardano', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'XRPUSDT', name: 'Ripple', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'SOLUSDT', name: 'Solana', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'MATICUSDT', name: 'Polygon', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'AVAXUSDT', name: 'Avalanche', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'DOTUSDT', name: 'Polkadot', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'LINKUSDT', name: 'Chainlink', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'UNIUSDT', name: 'Uniswap', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'LTCUSDT', name: 'Litecoin', category: 'CRYPTO', exchange: 'BINANCE' },
        { symbol: 'BCHUSDT', name: 'Bitcoin Cash', category: 'CRYPTO', exchange: 'BINANCE' }
      ],
      
      forex: [
        { symbol: 'EUR/USD', name: 'Euro/US Dollar', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'GBP/USD', name: 'British Pound/US Dollar', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'USD/CAD', name: 'US Dollar/Canadian Dollar', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'NZD/USD', name: 'New Zealand Dollar/US Dollar', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'EUR/GBP', name: 'Euro/British Pound', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'EUR/JPY', name: 'Euro/Japanese Yen', category: 'FOREX', exchange: 'TWELVEDATA' },
        { symbol: 'GBP/JPY', name: 'British Pound/Japanese Yen', category: 'FOREX', exchange: 'TWELVEDATA' }
      ],

      commodities: [
        { symbol: 'XAU/USD', name: 'Gold', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
        { symbol: 'XAG/USD', name: 'Silver', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
        { symbol: 'WTI/USD', name: 'Crude Oil WTI', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
        { symbol: 'BRENT/USD', name: 'Brent Oil', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
        { symbol: 'NATGAS/USD', name: 'Natural Gas', category: 'COMMODITIES', exchange: 'TWELVEDATA' }
      ],

      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'TSLA', name: 'Tesla Inc', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'MSFT', name: 'Microsoft Corp', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'AMZN', name: 'Amazon.com Inc', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'META', name: 'Meta Platforms Inc', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'NVDA', name: 'NVIDIA Corp', category: 'STOCKS', exchange: 'TWELVEDATA' },
        { symbol: 'NFLX', name: 'Netflix Inc', category: 'STOCKS', exchange: 'TWELVEDATA' }
      ]
    };

    const marketsToAdd = marketTemplates[category];
    if (!marketsToAdd) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const markets = marketsToAdd.map(market => ({
      ...market,
      payoutPercent: 87,
      minAmount: 1,
      maxAmount: 1000,
      status: 'ACTIVE',
      currentPrice: 0,
      priceChange: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert only new markets (avoid duplicates)
    const bulkOps = markets.map(market => ({
      updateOne: {
        filter: { symbol: market.symbol },
        update: { $setOnInsert: market },
        upsert: true
      }
    }));

    const result = await req.app.locals.db.collection('markets').bulkWrite(bulkOps);
    
    res.json({
      success: true,
      message: `${category} markets processed successfully`,
      inserted: result.upsertedCount,
      existing: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding bulk markets',
      error: error.message
    });
  }
});

module.exports = router;