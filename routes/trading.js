const express = require('express');
const router = express.Router();
const Trade = require('../models/trade');
const User = require('../models/user');
const Symbol = require('../models/symbol');
const authenticateToken = require('../middleware/auth');

// Get live markets for trading
router.get('/markets', async (req, res) => {
  try {
    const symbols = await Symbol.find({ 
      status: 'ACTIVE' 
    }).select('name symbol category payoutPercent minTradeAmount maxTradeAmount expiryOptions isPopular');
    
    // Add current prices from price socket
    const marketsWithPrices = symbols.map(symbol => ({
      ...symbol.toObject(),
      currentPrice: req.app.priceManager ? req.app.priceManager.getPrice(symbol.symbol)?.price : null,
      priceChange: req.app.priceManager ? req.app.priceManager.getPrice(symbol.symbol)?.change : null
    }));
    
    res.json({
      success: true,
      markets: marketsWithPrices
    });
    
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching markets'
    });
  }
});

// Get popular markets
router.get('/markets/popular', async (req, res) => {
  try {
    const symbols = await Symbol.find({ 
      status: 'ACTIVE',
      isPopular: true 
    }).limit(10);
    
    const marketsWithPrices = symbols.map(symbol => ({
      ...symbol.toObject(),
      currentPrice: req.app.priceManager ? req.app.priceManager.getPrice(symbol.symbol)?.price : null,
      priceChange: req.app.priceManager ? req.app.priceManager.getPrice(symbol.symbol)?.change : null
    }));
    
    res.json({
      success: true,
      markets: marketsWithPrices
    });
    
  } catch (error) {
    console.error('Error fetching popular markets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular markets'
    });
  }
});

// Place a new trade
router.post('/trade', authenticateToken, async (req, res) => {
  try {
    const { 
      symbol, 
      tradeType, 
      tradeAmount, 
      expiryTime 
    } = req.body;
    
    // Validation
    if (!symbol || !tradeType || !tradeAmount || !expiryTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (!['CALL', 'PUT'].includes(tradeType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade type. Use CALL or PUT'
      });
    }
    
    if (tradeAmount < 1 || tradeAmount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Trade amount must be between $1 and $10,000'
      });
    }
    
    if (![30, 60, 120, 300, 600].includes(expiryTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry time. Use 30, 60, 120, 300, or 600 seconds'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check wallet balance
    if (user.walletBalance < tradeAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }
    
    // Get symbol info
    const symbolInfo = await Symbol.findOne({ symbol, status: 'ACTIVE' });
    if (!symbolInfo) {
      return res.status(404).json({
        success: false,
        message: 'Symbol not found or inactive'
      });
    }
    
    // Check trade amount limits
    if (tradeAmount < symbolInfo.minTradeAmount || tradeAmount > symbolInfo.maxTradeAmount) {
      return res.status(400).json({
        success: false,
        message: `Trade amount must be between $${symbolInfo.minTradeAmount} and $${symbolInfo.maxTradeAmount}`
      });
    }
    
    // Get current price
    const priceData = req.app.priceManager ? req.app.priceManager.getPrice(symbol) : null;
    if (!priceData) {
      return res.status(503).json({
        success: false,
        message: 'Price data not available. Please try again.'
      });
    }
    
    // Deduct amount from wallet
    user.walletBalance -= tradeAmount;
    await user.save();
    
    // Create trade
    const trade = new Trade({
      userId: user._id,
      userEmail: user.email,
      symbol: symbol,
      symbolName: symbolInfo.name,
      category: symbolInfo.category,
      tradeType: tradeType,
      tradeAmount: tradeAmount,
      expiryTime: expiryTime,
      entryPrice: priceData.price,
      payoutPercent: symbolInfo.payoutPercent,
      walletBalanceBefore: user.walletBalance + tradeAmount, // before deduction
      priceSource: priceData.source,
      deviceInfo: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    });
    
    await trade.save();
    
    res.json({
      success: true,
      message: 'Trade placed successfully',
      trade: {
        tradeId: trade._id,
        symbol: trade.symbol,
        symbolName: trade.symbolName,
        tradeType: trade.tradeType,
        tradeAmount: trade.tradeAmount,
        expiryTime: trade.expiryTime,
        entryPrice: trade.entryPrice,
        possiblePayout: trade.possiblePayout,
        tradeEndTime: trade.tradeEndTime,
        walletBalance: user.walletBalance
      }
    });
    
  } catch (error) {
    console.error('Error placing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing trade'
    });
  }
});

// Get user's active trades
router.get('/trades/active', authenticateToken, async (req, res) => {
  try {
    const trades = await Trade.find({
      userId: req.user.userId,
      tradeStatus: 'PENDING'
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      trades: trades
    });
    
  } catch (error) {
    console.error('Error fetching active trades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active trades'
    });
  }
});

// Get user's trade history
router.get('/trades/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const trades = await Trade.find({
      userId: req.user.userId
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Trade.countDocuments({ userId: req.user.userId });
    
    res.json({
      success: true,
      trades: trades,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade history'
    });
  }
});

// Get user's trading statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Trade.getUserStats(req.user.userId);
    
    const result = stats[0] || {
      totalTrades: 0,
      totalWins: 0,
      totalLosses: 0,
      totalInvested: 0,
      totalPayout: 0,
      totalProfit: 0
    };
    
    result.winRate = result.totalTrades > 0 ? ((result.totalWins / result.totalTrades) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('Error fetching trading stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trading stats'
    });
  }
});

module.exports = router;