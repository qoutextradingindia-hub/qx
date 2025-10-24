const express = require('express');
const router = express.Router();
const Symbol = require('../models/symbol');

// User Auth Middleware (simplified for now)
const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }
    // Add proper JWT verification here
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized user access' });
  }
};

// GET /user/market - Get active trading symbols for dashboard
router.get('/market', async (req, res) => {
  try {
    const { category, popular } = req.query;
    
    const filter = { status: 'ACTIVE' };
    if (category) filter.category = category;
    if (popular === 'true') filter.isPopular = true;
    
    const symbols = await Symbol.find(filter)
      .select('name symbol category payoutPercent icon isPopular lastPrice priceChange24h volume24h minTradeAmount maxTradeAmount expiryOptions')
      .sort({ isPopular: -1, sortOrder: 1, name: 1 });
    
    // Group by category for better UX
    const groupedSymbols = symbols.reduce((acc, symbol) => {
      if (!acc[symbol.category]) {
        acc[symbol.category] = [];
      }
      acc[symbol.category].push({
        id: symbol._id,
        name: symbol.name,
        symbol: symbol.symbol,
        category: symbol.category,
        payoutPercent: symbol.payoutPercent,
        icon: symbol.icon,
        isPopular: symbol.isPopular,
        lastPrice: symbol.lastPrice,
        priceChange24h: symbol.priceChange24h,
        volume24h: symbol.volume24h,
        minTradeAmount: symbol.minTradeAmount,
        maxTradeAmount: symbol.maxTradeAmount,
        expiryOptions: symbol.expiryOptions
      });
      return acc;
    }, {});
    
    res.json({
      success: true,
      markets: groupedSymbols,
      totalSymbols: symbols.length,
      categories: Object.keys(groupedSymbols)
    });
  } catch (error) {
    console.error('User market list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch market data' });
  }
});

// GET /user/market/:symbol - Get specific symbol details
router.get('/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const symbolData = await Symbol.findOne({ 
      symbol: symbol.toUpperCase(), 
      status: 'ACTIVE' 
    }).select('name symbol category payoutPercent icon lastPrice priceChange24h volume24h minTradeAmount maxTradeAmount expiryOptions binanceSymbol twelveDataSymbol');
    
    if (!symbolData) {
      return res.status(404).json({ success: false, message: 'Symbol not found or inactive' });
    }
    
    res.json({
      success: true,
      symbol: {
        id: symbolData._id,
        name: symbolData.name,
        symbol: symbolData.symbol,
        category: symbolData.category,
        payoutPercent: symbolData.payoutPercent,
        icon: symbolData.icon,
        lastPrice: symbolData.lastPrice,
        priceChange24h: symbolData.priceChange24h,
        volume24h: symbolData.volume24h,
        minTradeAmount: symbolData.minTradeAmount,
        maxTradeAmount: symbolData.maxTradeAmount,
        expiryOptions: symbolData.expiryOptions,
        binanceSymbol: symbolData.binanceSymbol,
        twelveDataSymbol: symbolData.twelveDataSymbol
      }
    });
  } catch (error) {
    console.error('User symbol detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch symbol details' });
  }
});

// GET /user/market/popular - Get popular symbols only
router.get('/market/popular', async (req, res) => {
  try {
    const symbols = await Symbol.find({ 
      status: 'ACTIVE', 
      isPopular: true 
    })
    .select('name symbol category payoutPercent icon lastPrice priceChange24h')
    .sort({ sortOrder: 1, name: 1 })
    .limit(10);
    
    res.json({
      success: true,
      popularSymbols: symbols.map(symbol => ({
        id: symbol._id,
        name: symbol.name,
        symbol: symbol.symbol,
        category: symbol.category,
        payoutPercent: symbol.payoutPercent,
        icon: symbol.icon,
        lastPrice: symbol.lastPrice,
        priceChange24h: symbol.priceChange24h
      }))
    });
  } catch (error) {
    console.error('User popular symbols error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popular symbols' });
  }
});

module.exports = router;