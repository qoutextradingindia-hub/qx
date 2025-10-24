require('dotenv').config();
const mongoose = require('mongoose');
const Symbol = require('./models/symbol');

const defaultSymbols = [
  {
    name: 'Bitcoin',
    symbol: 'BTCUSDT',
    category: 'CRYPTO',
    payoutPercent: 85,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    binanceSymbol: 'BTCUSDT',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: 'Ethereum',
    symbol: 'ETHUSDT',
    category: 'CRYPTO',
    payoutPercent: 85,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    binanceSymbol: 'ETHUSDT',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: 'EUR/USD',
    symbol: 'EURUSD',
    category: 'FOREX',
    payoutPercent: 80,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    twelveDataSymbol: 'EUR/USD',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: 'Apple Inc',
    symbol: 'AAPL',
    category: 'STOCKS',
    payoutPercent: 82,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    twelveDataSymbol: 'AAPL',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: 'Gold',
    symbol: 'XAUUSD',
    category: 'COMMODITIES',
    payoutPercent: 83,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    twelveDataSymbol: 'XAU/USD',
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: 'Tesla Inc',
    symbol: 'TSLA',
    category: 'STOCKS',
    payoutPercent: 82,
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    expiryOptions: [30, 60, 120, 300, 600],
    isPopular: true,
    status: 'ACTIVE',
    twelveDataSymbol: 'TSLA',
    createdBy: new mongoose.Types.ObjectId()
  }
];

async function setupDefaultSymbols() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Clear existing symbols
    await Symbol.deleteMany({});
    console.log('Cleared existing symbols');

    // Insert default symbols
    await Symbol.insertMany(defaultSymbols);
    console.log('✅ Default symbols created successfully:');
    
    defaultSymbols.forEach(symbol => {
      console.log(`   - ${symbol.name} (${symbol.symbol})`);
    });

    console.log('\n🚀 Binary trading symbols are ready!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up symbols:', error);
    process.exit(1);
  }
}

setupDefaultSymbols();