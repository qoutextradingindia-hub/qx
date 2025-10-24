const mongoose = require('mongoose');

const symbolSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  }, // e.g., "Bitcoin"
  symbol: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  }, // e.g., "BTCUSDT"
  category: { 
    type: String, 
    required: true,
    enum: ['CRYPTO', 'FOREX', 'STOCKS', 'COMMODITIES'],
    default: 'CRYPTO'
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], 
    default: 'INACTIVE' 
  },
  payoutPercent: { 
    type: Number, 
    default: 80,
    min: 50,
    max: 95
  }, // Win payout percentage
  icon: { 
    type: String, 
    default: '' 
  }, // URL or path to icon
  binanceSymbol: { 
    type: String, 
    default: '' 
  }, // For Binance WebSocket mapping
  twelveDataSymbol: { 
    type: String, 
    default: '' 
  }, // For TwelveData API mapping
  minTradeAmount: { 
    type: Number, 
    default: 1 
  },
  maxTradeAmount: { 
    type: Number, 
    default: 1000 
  },
  expiryOptions: [{ 
    type: Number, 
    default: [30, 60, 120, 300] 
  }], // Available expiry times in seconds
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  lastPrice: { 
    type: Number, 
    default: 0 
  },
  priceChange24h: { 
    type: Number, 
    default: 0 
  },
  volume24h: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, { 
  timestamps: true 
});

// Indexes for better performance
symbolSchema.index({ status: 1, category: 1 });
symbolSchema.index({ symbol: 1 });
symbolSchema.index({ isPopular: -1, sortOrder: 1 });

module.exports = mongoose.model('Symbol', symbolSchema);