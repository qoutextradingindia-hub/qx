import React, { useState, useEffect } from 'react';
import './AdminMarkets.css';

const AdminMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState({
    binanceKey: '',
    binanceSecret: '',
    twelveDataKey: ''
  });
  const [keysLoading, setKeysLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMarkets: 0,
    cryptoCount: 0,
    forexCount: 0,
    commodityCount: 0,
    stockCount: 0
  });

  useEffect(() => {
    fetchMarkets();
    fetchApiKeys();
    fetchStats();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await fetch('/api/admin/markets');
      const data = await response.json();
      if (data.success) {
        setMarkets(data.markets);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.apiKeys);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/market-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveApiKeys = async () => {
    setKeysLoading(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiKeys)
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ API keys saved successfully!');
      } else {
        alert('❌ Failed to save API keys');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      alert('❌ Error saving API keys');
    } finally {
      setKeysLoading(false);
    }
  };

  const handleBulkAddMarkets = async (category) => {
    try {
      const response = await fetch('/api/admin/bulk-add-markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.added} ${category} markets added successfully!`);
        fetchMarkets();
        fetchStats();
      } else {
        alert(`❌ Failed to add ${category} markets`);
      }
    } catch (error) {
      console.error('Error adding bulk markets:', error);
      alert('❌ Error adding markets');
    }
  };

  const toggleMarketStatus = async (marketId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/markets/${marketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchMarkets();
      }
    } catch (error) {
      console.error('Error toggling market status:', error);
    }
  };

  const deleteMarket = async (marketId) => {
    if (window.confirm('Are you sure you want to delete this market?')) {
      try {
        const response = await fetch(`/api/admin/markets/${marketId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchMarkets();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting market:', error);
      }
    }
  };

  return (
    <div className="admin-markets-container">
      <div className="admin-header">
        <h1>🚀 Market Management</h1>
        <p>Manage trading markets and API configurations</p>
      </div>

      {/* API Keys Section */}
      <div className="api-keys-section">
        <h2>🔑 API Keys Configuration</h2>
        <div className="api-keys-grid">
          <div className="api-key-group">
            <label>Binance API Key</label>
            <input
              type="text"
              value={apiKeys.binanceKey}
              onChange={(e) => setApiKeys({ ...apiKeys, binanceKey: e.target.value })}
              placeholder="Enter Binance API Key"
            />
          </div>
          <div className="api-key-group">
            <label>Binance Secret Key</label>
            <input
              type="password"
              value={apiKeys.binanceSecret}
              onChange={(e) => setApiKeys({ ...apiKeys, binanceSecret: e.target.value })}
              placeholder="Enter Binance Secret Key"
            />
          </div>
          <div className="api-key-group">
            <label>TwelveData API Key</label>
            <input
              type="text"
              value={apiKeys.twelveDataKey}
              onChange={(e) => setApiKeys({ ...apiKeys, twelveDataKey: e.target.value })}
              placeholder="Enter TwelveData API Key"
            />
          </div>
          <button 
            className="save-keys-btn" 
            onClick={handleSaveApiKeys}
            disabled={keysLoading}
          >
            {keysLoading ? '⏳ Saving...' : '💾 Save API Keys'}
          </button>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="market-stats">
        <h2>📊 Market Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalMarkets}</div>
            <div className="stat-label">Total Markets</div>
          </div>
          <div className="stat-card crypto">
            <div className="stat-number">{stats.cryptoCount}</div>
            <div className="stat-label">Crypto</div>
          </div>
          <div className="stat-card forex">
            <div className="stat-number">{stats.forexCount}</div>
            <div className="stat-label">Forex</div>
          </div>
          <div className="stat-card commodity">
            <div className="stat-number">{stats.commodityCount}</div>
            <div className="stat-label">Commodities</div>
          </div>
          <div className="stat-card stock">
            <div className="stat-number">{stats.stockCount}</div>
            <div className="stat-label">Stocks</div>
          </div>
        </div>
      </div>

      {/* Bulk Add Markets */}
      <div className="bulk-add-section">
        <h2>⚡ Bulk Add Markets</h2>
        <div className="bulk-buttons">
          <button 
            className="bulk-btn crypto"
            onClick={() => handleBulkAddMarkets('crypto')}
          >
            📈 Add All Crypto Markets (15)
          </button>
          <button 
            className="bulk-btn forex"
            onClick={() => handleBulkAddMarkets('forex')}
          >
            💱 Add All Forex Markets (10)
          </button>
          <button 
            className="bulk-btn commodity"
            onClick={() => handleBulkAddMarkets('commodities')}
          >
            🥇 Add All Commodity Markets (5)
          </button>
          <button 
            className="bulk-btn stock"
            onClick={() => handleBulkAddMarkets('stocks')}
          >
            📊 Add All Stock Markets (8)
          </button>
        </div>
      </div>

      {/* Markets List */}
      <div className="markets-list-section">
        <h2>🎯 Current Markets</h2>
        {loading ? (
          <div className="loading">⏳ Loading markets...</div>
        ) : (
          <div className="markets-table">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market._id}>
                    <td className="symbol-cell">
                      <span className={`flag ${market.symbol.toLowerCase()}`}></span>
                      {market.symbol}
                    </td>
                    <td>{market.name}</td>
                    <td>
                      <span className={`category-badge ${market.category}`}>
                        {market.category}
                      </span>
                    </td>
                    <td>{market.source}</td>
                    <td>
                      <span className={`status-badge ${market.active ? 'active' : 'inactive'}`}>
                        {market.active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className={`toggle-btn ${market.active ? 'active' : 'inactive'}`}
                        onClick={() => toggleMarketStatus(market._id, market.active)}
                      >
                        {market.active ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteMarket(market._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {markets.length === 0 && (
              <div className="no-markets">
                📭 No markets found. Use bulk add buttons to add markets.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarkets;