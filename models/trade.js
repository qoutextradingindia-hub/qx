const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  // User info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Trade details
  symbol: {
    type: String,
    required: true // BTCUSDT, EUR/USD, etc.
  },
  symbolName: {
    type: String,
    required: true // Bitcoin, Euro/USD, etc.
  },
  category: {
    type: String,
    required: true,
    enum: ['CRYPTO', 'FOREX', 'INDICES', 'COMMODITIES', 'STOCKS']
  },
  
  // Trade execution
  tradeType: {
    type: String,
    required: true,
    enum: ['CALL', 'PUT'] // Higher or Lower
  },
  tradeAmount: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  expiryTime: {
    type: Number,
    required: true // in seconds: 30, 60, 120, 300
  },
  
  // Price data
  entryPrice: {
    type: Number,
    required: true // Price when trade was placed
  },
  exitPrice: {
    type: Number,
    default: null // Price when trade expires
  },
  
  // Timestamps
  tradeStartTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  tradeEndTime: {
    type: Date,
    required: true // calculated: startTime + expiryTime
  },
  
  // Trade result
  tradeStatus: {
    type: String,
    required: true,
    enum: ['PENDING', 'WIN', 'LOSS', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Payout calculation
  payoutPercent: {
    type: Number,
    required: true,
    default: 80 // 80% payout on win
  },
  possiblePayout: {
    type: Number,
    required: true // tradeAmount + (tradeAmount * payoutPercent / 100)
  },
  actualPayout: {
    type: Number,
    default: 0 // actual amount credited to wallet
  },
  
  // Wallet impact
  walletBalanceBefore: {
    type: Number,
    required: true
  },
  walletBalanceAfter: {
    type: Number,
    default: null
  },
  
  // Additional data
  priceSource: {
    type: String,
    required: true,
    enum: ['binance', 'twelvedata']
  },
  deviceInfo: {
    ip: String,
    userAgent: String
  },
  
  // Processing
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date,
    default: null
  },
  
  // Metadata
  notes: String,
  
}, {
  timestamps: true // createdAt, updatedAt
});

// Indexes for performance
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ tradeStatus: 1, tradeEndTime: 1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ tradeEndTime: 1, isProcessed: 1 }); // For expiry processing

// Calculate trade end time before saving
tradeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.tradeEndTime = new Date(this.tradeStartTime.getTime() + (this.expiryTime * 1000));
    this.possiblePayout = this.tradeAmount + (this.tradeAmount * this.payoutPercent / 100);
  }
  next();
});

// Instance methods
tradeSchema.methods.isExpired = function() {
  return new Date() >= this.tradeEndTime;
};

tradeSchema.methods.calculateResult = function(currentPrice) {
  if (this.tradeStatus !== 'PENDING') return;
  
  this.exitPrice = currentPrice;
  
  if (this.tradeType === 'CALL') {
    this.tradeStatus = currentPrice > this.entryPrice ? 'WIN' : 'LOSS';
  } else { // PUT
    this.tradeStatus = currentPrice < this.entryPrice ? 'WIN' : 'LOSS';
  }
  
  if (this.tradeStatus === 'WIN') {
    this.actualPayout = this.possiblePayout;
  } else {
    this.actualPayout = 0;
  }
  
  this.isProcessed = true;
  this.processedAt = new Date();
};

// Static methods
tradeSchema.statics.getPendingTrades = function() {
  return this.find({
    tradeStatus: 'PENDING',
    tradeEndTime: { $lte: new Date() },
    isProcessed: false
  });
};

tradeSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalWins: {
          $sum: { $cond: [{ $eq: ['$tradeStatus', 'WIN'] }, 1, 0] }
        },
        totalLosses: {
          $sum: { $cond: [{ $eq: ['$tradeStatus', 'LOSS'] }, 1, 0] }
        },
        totalInvested: { $sum: '$tradeAmount' },
        totalPayout: { $sum: '$actualPayout' },
        totalProfit: {
          $sum: {
            $subtract: ['$actualPayout', '$tradeAmount']
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Trade', tradeSchema);