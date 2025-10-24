// Binary Trading Price Socket Manager
// Binance WebSocket + TwelveData API Integration

const WebSocket = require('ws');
const axios = require('axios');

class PriceSocketManager {
  constructor() {
    this.binanceWs = null;
    this.priceData = {};
    this.subscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // Binance symbols for crypto
    this.binanceSymbols = [
      'btcusdt', 'ethusdt', 'bnbusdt', 'adausdt', 'dotusdt',
      'linkusdt', 'ltcusdt', 'bchusdt', 'xlmusdt', 'eosusdt'
    ];
    
    // TwelveData symbols for forex/indices  
    this.twelveDataSymbols = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
      'SPX', 'DJI', 'IXIC', 'FTSE', 'DAX'
    ];
  }

  // Start Binance WebSocket for crypto prices
  startBinanceSocket() {
    const symbols = this.binanceSymbols.map(s => `${s}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbols}`;
    
    console.log('🔗 Connecting to Binance WebSocket...');
    this.binanceWs = new WebSocket(wsUrl);
    
    this.binanceWs.on('open', () => {
      console.log('✅ Binance WebSocket Connected');
      this.reconnectAttempts = 0;
    });
    
    this.binanceWs.on('message', (data) => {
      try {
        const ticker = JSON.parse(data);
        const symbol = ticker.s; // BTCUSDT
        const price = parseFloat(ticker.c); // Current price
        const change = parseFloat(ticker.P); // 24h change %
        
        this.priceData[symbol] = {
          symbol: symbol,
          price: price,
          change: change,
          timestamp: Date.now(),
          source: 'binance'
        };
        
        // Broadcast to all subscribers
        this.broadcastPrice(symbol, this.priceData[symbol]);
        
      } catch (error) {
        console.error('❌ Binance data parse error:', error);
      }
    });
    
    this.binanceWs.on('close', () => {
      console.log('🔌 Binance WebSocket Disconnected');
      this.reconnectBinance();
    });
    
    this.binanceWs.on('error', (error) => {
      console.error('❌ Binance WebSocket Error:', error);
      this.reconnectBinance();
    });
  }

  // Reconnect Binance with exponential backoff
  reconnectBinance() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached for Binance');
      return;
    }
    
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;
    
    console.log(`🔄 Reconnecting Binance in ${delay/1000}s (Attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.startBinanceSocket();
    }, delay);
  }

  // Fetch TwelveData prices (REST API)
  async fetchTwelveDataPrices() {
    const API_KEY = process.env.TWELVE_DATA_API_KEY || 'demo'; // Add to .env
    
    for (const symbol of this.twelveDataSymbols) {
      try {
        const response = await axios.get(`https://api.twelvedata.com/price`, {
          params: {
            symbol: symbol,
            apikey: API_KEY
          }
        });
        
        if (response.data && response.data.price) {
          const price = parseFloat(response.data.price);
          
          this.priceData[symbol] = {
            symbol: symbol,
            price: price,
            change: 0, // Would need separate endpoint for change
            timestamp: Date.now(),
            source: 'twelvedata'
          };
          
          this.broadcastPrice(symbol, this.priceData[symbol]);
        }
        
      } catch (error) {
        console.error(`❌ TwelveData error for ${symbol}:`, error.message);
      }
      
      // Rate limiting - 8 calls per minute for free tier
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }

  // Start TwelveData polling
  startTwelveDataPolling() {
    console.log('🔗 Starting TwelveData polling...');
    
    // Initial fetch
    this.fetchTwelveDataPrices();
    
    // Poll every 1 minute (free tier limit)
    setInterval(() => {
      this.fetchTwelveDataPrices();
    }, 60000);
  }

  // Broadcast price to all subscribers
  broadcastPrice(symbol, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(symbol, data);
      } catch (error) {
        console.error('❌ Subscriber callback error:', error);
      }
    });
  }

  // Subscribe to price updates
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Send current prices immediately
    Object.entries(this.priceData).forEach(([symbol, data]) => {
      callback(symbol, data);
    });
    
    return () => this.subscribers.delete(callback);
  }

  // Get current price for specific symbol
  getPrice(symbol) {
    return this.priceData[symbol] || null;
  }

  // Get all current prices
  getAllPrices() {
    return { ...this.priceData };
  }

  // Start all price feeds
  start() {
    console.log('🚀 Starting Price Socket Manager...');
    this.startBinanceSocket();
    this.startTwelveDataPolling();
  }

  // Stop all connections
  stop() {
    console.log('🛑 Stopping Price Socket Manager...');
    if (this.binanceWs) {
      this.binanceWs.close();
    }
    this.subscribers.clear();
  }
}

module.exports = PriceSocketManager;