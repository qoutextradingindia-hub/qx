import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [apiKeys, setApiKeys] = useState({
    binanceApiKey: '',
    binanceSecretKey: '',
    twelveDataApiKey: '',
    alphaVantageApiKey: '',
    polygonApiKey: ''
  });
  
  const [markets, setMarkets] = useState([]);
  const [newMarket, setNewMarket] = useState({
    symbol: '',
    name: '',
    category: 'CRYPTO',
    exchange: 'BINANCE',
    payoutPercent: 87,
    minAmount: 1,
    maxAmount: 1000,
    status: 'ACTIVE'
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'https://qxtrand.onrender.com';

  // Load API keys and markets on component mount
  useEffect(() => {
    loadApiKeys();
    loadMarkets();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/api-keys`);
      if (response.data.success) {
        setApiKeys(response.data.keys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const loadMarkets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/trading/markets`);
      if (response.data.success) {
        setMarkets(response.data.markets);
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    }
  };

  const saveApiKeys = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/api-keys`, apiKeys);
      if (response.data.success) {
        alert('API Keys saved successfully!');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      alert('Error saving API keys');
    }
  };

  const addMarket = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/markets`, newMarket);
      if (response.data.success) {
        alert('Market added successfully!');
        loadMarkets();
        setNewMarket({
          symbol: '',
          name: '',
          category: 'CRYPTO',
          exchange: 'BINANCE',
          payoutPercent: 87,
          minAmount: 1,
          maxAmount: 1000,
          status: 'ACTIVE'
        });
      }
    } catch (error) {
      console.error('Error adding market:', error);
      alert('Error adding market');
    }
  };

  const deleteMarket = async (marketId) => {
    if (window.confirm('Are you sure you want to delete this market?')) {
      try {
        const response = await axios.delete(`${API_BASE}/api/admin/markets/${marketId}`);
        if (response.data.success) {
          alert('Market deleted successfully!');
          loadMarkets();
        }
      } catch (error) {
        console.error('Error deleting market:', error);
        alert('Error deleting market');
      }
    }
  };

  // Pre-defined market templates
  const marketTemplates = {
    // Binance Crypto
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
    
    // TwelveData Forex
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

    // Commodities
    commodities: [
      { symbol: 'XAU/USD', name: 'Gold', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
      { symbol: 'XAG/USD', name: 'Silver', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
      { symbol: 'WTI/USD', name: 'Crude Oil WTI', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
      { symbol: 'BRENT/USD', name: 'Brent Oil', category: 'COMMODITIES', exchange: 'TWELVEDATA' },
      { symbol: 'NATGAS/USD', name: 'Natural Gas', category: 'COMMODITIES', exchange: 'TWELVEDATA' }
    ],

    // Stocks
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

  const addBulkMarkets = async (category) => {
    try {
      const marketsToAdd = marketTemplates[category];
      for (const market of marketsToAdd) {
        const marketData = {
          ...market,
          payoutPercent: 87,
          minAmount: 1,
          maxAmount: 1000,
          status: 'ACTIVE'
        };
        await axios.post(`${API_BASE}/api/admin/markets`, marketData);
      }
      alert(`${marketsToAdd.length} ${category} markets added successfully!`);
      loadMarkets();
    } catch (error) {
      console.error(`Error adding ${category} markets:`, error);
      alert(`Error adding ${category} markets`);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      color: '#FFFFFF',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🔧 Trading Platform Admin Panel
      </h1>

      {/* API Keys Section */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>🔑 API Keys Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Binance API Key:</label>
            <input
              type="text"
              value={apiKeys.binanceApiKey}
              onChange={(e) => setApiKeys({...apiKeys, binanceApiKey: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="Enter Binance API Key"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Binance Secret Key:</label>
            <input
              type="password"
              value={apiKeys.binanceSecretKey}
              onChange={(e) => setApiKeys({...apiKeys, binanceSecretKey: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="Enter Binance Secret Key"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>TwelveData API Key:</label>
            <input
              type="text"
              value={apiKeys.twelveDataApiKey}
              onChange={(e) => setApiKeys({...apiKeys, twelveDataApiKey: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="Enter TwelveData API Key"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Alpha Vantage API Key:</label>
            <input
              type="text"
              value={apiKeys.alphaVantageApiKey}
              onChange={(e) => setApiKeys({...apiKeys, alphaVantageApiKey: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="Enter Alpha Vantage API Key"
            />
          </div>
        </div>
        
        <button
          onClick={saveApiKeys}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          💾 Save API Keys
        </button>
      </div>

      {/* Quick Add Markets Section */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>⚡ Quick Add Markets (Bulk)</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => addBulkMarkets('crypto')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#FF9800',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💰 Add All Crypto (15)
          </button>
          
          <button
            onClick={() => addBulkMarkets('forex')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#2196F3',
              color: '#FFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💱 Add All Forex (10)
          </button>
          
          <button
            onClick={() => addBulkMarkets('commodities')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#9C27B0',
              color: '#FFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🥇 Add Commodities (5)
          </button>
          
          <button
            onClick={() => addBulkMarkets('stocks')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📈 Add Stocks (8)
          </button>
        </div>
      </div>

      {/* Add Single Market Section */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>➕ Add Single Market</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Symbol:</label>
            <input
              type="text"
              value={newMarket.symbol}
              onChange={(e) => setNewMarket({...newMarket, symbol: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="e.g., BTCUSDT"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              value={newMarket.name}
              onChange={(e) => setNewMarket({...newMarket, name: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              placeholder="e.g., Bitcoin"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
            <select
              value={newMarket.category}
              onChange={(e) => setNewMarket({...newMarket, category: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
            >
              <option value="CRYPTO">Crypto</option>
              <option value="FOREX">Forex</option>
              <option value="COMMODITIES">Commodities</option>
              <option value="STOCKS">Stocks</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Exchange:</label>
            <select
              value={newMarket.exchange}
              onChange={(e) => setNewMarket({...newMarket, exchange: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
            >
              <option value="BINANCE">Binance</option>
              <option value="TWELVEDATA">TwelveData</option>
              <option value="ALPHAVANTAGE">Alpha Vantage</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Payout %:</label>
            <input
              type="number"
              value={newMarket.payoutPercent}
              onChange={(e) => setNewMarket({...newMarket, payoutPercent: Number(e.target.value)})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                color: '#FFFFFF'
              }}
              min="50"
              max="95"
            />
          </div>
        </div>

        <button
          onClick={addMarket}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Add Market
        </button>
      </div>

      {/* Current Markets List */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h2>📊 Current Markets ({markets.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#2a3441' }}>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Symbol</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Category</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Exchange</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Payout %</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #3d4a5c' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>{market.symbol}</td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>{market.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>{market.category}</td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>{market.exchange}</td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>{market.payoutPercent}%</td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>
                    <span style={{ 
                      color: market.status === 'ACTIVE' ? '#4CAF50' : '#FF5252' 
                    }}>
                      {market.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #3d4a5c' }}>
                    <button
                      onClick={() => deleteMarket(market._id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#FF5252',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Information */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '30px'
      }}>
        <h2>📋 API Information</h2>
        <div style={{ fontSize: '14px', color: '#888' }}>
          <h3>🔗 Where to get API Keys:</h3>
          <ul>
            <li><strong>Binance:</strong> binance.com → Account → API Management</li>
            <li><strong>TwelveData:</strong> twelvedata.com → API → Get Free API Key</li>
            <li><strong>Alpha Vantage:</strong> alphavantage.co → Get Free API Key</li>
          </ul>
          
          <h3>📊 Market Categories:</h3>
          <ul>
            <li><strong>CRYPTO:</strong> Bitcoin, Ethereum, etc. (Use Binance)</li>
            <li><strong>FOREX:</strong> EUR/USD, GBP/USD, etc. (Use TwelveData)</li>
            <li><strong>COMMODITIES:</strong> Gold, Silver, Oil (Use TwelveData)</li>
            <li><strong>STOCKS:</strong> Apple, Tesla, Google (Use TwelveData)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;