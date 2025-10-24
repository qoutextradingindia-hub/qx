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
    this.maxReconnectAttempts = 3; // Reduced attempts
    this.reconnectDelay = 5000; // 5 seconds delay
    
    // Binance symbols for crypto - reduced list
    this.binanceSymbols = [
      'btcusdt', 'ethusdt', 'bnbusdt', 'adausdt'
    ];
    
    // TwelveData symbols for forex/indices  
    this.twelveDataSymbols = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'
    ];
    
    // Fallback price data for when WebSocket fails
    this.fallbackPrices = {
      'BTCUSDT': { price: 67000, change: 2.5 },
      'ETHUSDT': { price: 2600, change: 1.8 },
      'BNBUSDT': { price: 590, change: 0.5 },
      'ADAUSDT': { price: 0.45, change: -0.3 }
    };
  }

  // Start Binance WebSocket for crypto prices
  startBinanceSocket() {
    try {
      // Use different WebSocket endpoint 
      const symbols = this.binanceSymbols.map(s => `${s}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:443/ws/${symbols}`;
      
      console.log('🔗 Connecting to Binance WebSocket (Alternative endpoint)...');
      console.log('📡 Symbols:', this.binanceSymbols.join(', '));
      
      this.binanceWs = new WebSocket(wsUrl, {
        headers: {
          'User-Agent': 'StarTraders-BinaryPlatform/1.0'
        }
      });
      
      this.binanceWs.on('open', () => {
        console.log('✅ Binance WebSocket Connected successfully');
        this.reconnectAttempts = 0;
        
        // Load fallback prices initially
        this.loadFallbackPrices();
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
      
      this.binanceWs.on('close', (code, reason) => {
        console.log(`🔌 Binance WebSocket Disconnected: ${code} ${reason}`);
        this.handleConnectionFailure();
      });
      
      this.binanceWs.on('error', (error) => {
        console.error('❌ Binance WebSocket Error:', error.message);
        this.handleConnectionFailure();
      });
      
    } catch (error) {
      console.error('❌ Failed to create Binance WebSocket:', error);
      this.handleConnectionFailure();
    }
  }

  // Handle connection failure with fallback
  handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectBinance();
    } else {
      console.log('⚠️ Switching to fallback price mode...');
      this.loadFallbackPrices();
      this.startFallbackPriceUpdates();
    }
  }

  // Load fallback prices when WebSocket fails
  loadFallbackPrices() {
    Object.entries(this.fallbackPrices).forEach(([symbol, data]) => {
      this.priceData[symbol] = {
        symbol: symbol,
        price: data.price,
        change: data.change,
        timestamp: Date.now(),
        source: 'fallback'
      };
      
      this.broadcastPrice(symbol, this.priceData[symbol]);
    });
    
    console.log('📊 Fallback prices loaded for', Object.keys(this.fallbackPrices).length, 'symbols');
  }

  // Start fallback price simulation
  startFallbackPriceUpdates() {
    setInterval(() => {
      Object.entries(this.fallbackPrices).forEach(([symbol, baseData]) => {
        // Simulate small price fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newPrice = baseData.price * (1 + fluctuation);
        
        this.priceData[symbol] = {
          symbol: symbol,
          price: newPrice,
          change: baseData.change + (fluctuation * 100),
          timestamp: Date.now(),
          source: 'fallback-simulation'
        };
        
        this.broadcastPrice(symbol, this.priceData[symbol]);
      });
    }, 3000); // Update every 3 seconds
  }

  // Reconnect Binance with exponential backoff
  reconnectBinance() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached for Binance, switching to fallback');
      this.loadFallbackPrices();
      this.startFallbackPriceUpdates();
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    this.reconnectAttempts++;
    
    console.log(`🔄 Reconnecting Binance in ${delay/1000}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
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
    console.log('🚀 Starting Price Socket Manager with fallback support...');
    
    // Try Binance WebSocket first
    this.startBinanceSocket();
    
    // Always start TwelveData as backup
    setTimeout(() => {
      this.startTwelveDataPolling();
    }, 2000);
    
    // Load fallback prices immediately for instant availability
    this.loadFallbackPrices();
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