import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TradingInterface.css';

const TradingInterface = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [expiryTime, setExpiryTime] = useState(30);
  const [activeTrades, setActiveTrades] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [priceData, setPriceData] = useState({});
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  
  const priceUpdateInterval = useRef(null);
  const API_BASE = process.env.REACT_APP_API_URL || 'https://qxtrand.onrender.com';

  // Load markets and user data on component mount
  useEffect(() => {
    fetchMarkets();
    fetchActiveTrades();
    fetchUserBalance();
    startPriceUpdates();
    
    return () => {
      if (priceUpdateInterval.current) {
        clearInterval(priceUpdateInterval.current);
      }
    };
  }, []);

  // Fetch available markets
  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/trading/markets`);
      if (response.data.success) {
        setMarkets(response.data.markets);
        if (response.data.markets.length > 0 && !selectedMarket) {
          setSelectedMarket(response.data.markets[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active trades
  const fetchActiveTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/trading/trades/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setActiveTrades(response.data.trades);
      }
    } catch (error) {
      console.error('Error fetching active trades:', error);
    }
  };

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      // Assuming you have a user profile endpoint
      const response = await axios.get(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserBalance(response.data.user.walletBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  // Start price updates
  const startPriceUpdates = () => {
    priceUpdateInterval.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/trading/markets`);
        if (response.data.success) {
          const updatedPrices = {};
          response.data.markets.forEach(market => {
            const newPrice = market.currentPrice;
            updatedPrices[market.symbol] = {
              price: newPrice,
              change: market.priceChange
            };
            
            // Update price history for charts
            setPriceHistory(prev => {
              const symbolHistory = prev[market.symbol] || [];
              const newHistory = [...symbolHistory, {
                price: newPrice,
                timestamp: Date.now()
              }].slice(-50); // Keep last 50 points
              
              return {
                ...prev,
                [market.symbol]: newHistory
              };
            });
          });
          setPriceData(updatedPrices);
        }
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 2000); // Update every 2 seconds
  };

  // Place trade
  const placeTrade = async (tradeType) => {
    if (!selectedMarket || placing) return;
    
    if (tradeAmount > userBalance) {
      alert('Insufficient balance!');
      return;
    }

    setPlacing(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/trading/trade`, {
        symbol: selectedMarket.symbol,
        tradeType: tradeType,
        tradeAmount: tradeAmount,
        expiryTime: expiryTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert(`${tradeType} trade placed successfully!`);
        fetchActiveTrades();
        fetchUserBalance();
      } else {
        alert(response.data.message || 'Error placing trade');
      }
    } catch (error) {
      console.error('Error placing trade:', error);
      alert(error.response?.data?.message || 'Error placing trade');
    } finally {
      setPlacing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount || 0);
  };

  // Format time remaining
  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = Math.max(0, end - now);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="trading-loading">
        <div className="loading-spinner"></div>
        <p>Loading markets...</p>
      </div>
    );
  }

  return (
    <div className="trading-interface">
      {/* Header */}
      <div className="trading-header">
        <div className="user-balance">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount">{formatCurrency(userBalance)}</span>
        </div>
      </div>

      {/* Market Selector */}
      <div className="market-selector">
        <h3>Select Market</h3>
        <div className="market-grid">
          {markets.map(market => (
            <div 
              key={market.symbol}
              className={`market-card ${selectedMarket?.symbol === market.symbol ? 'selected' : ''}`}
              onClick={() => setSelectedMarket(market)}
            >
              <div className="market-name">{market.name}</div>
              <div className="market-symbol">{market.symbol}</div>
              <div className="market-price">
                {formatCurrency(priceData[market.symbol]?.price || market.currentPrice)}
              </div>
              <div className={`market-change ${(priceData[market.symbol]?.change || market.priceChange || 0) >= 0 ? 'positive' : 'negative'}`}>
                {((priceData[market.symbol]?.change || market.priceChange || 0) >= 0 ? '+' : '')}{(priceData[market.symbol]?.change || market.priceChange || 0).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Panel */}
      {selectedMarket && (
        <div className="trading-panel">
          <div className="selected-market">
            <h2>{selectedMarket.name}</h2>
            <div className="current-price">
              {formatCurrency(priceData[selectedMarket.symbol]?.price || selectedMarket.currentPrice)}
            </div>
            <div className={`price-change ${(priceData[selectedMarket.symbol]?.change || selectedMarket.priceChange || 0) >= 0 ? 'positive' : 'negative'}`}>
              {((priceData[selectedMarket.symbol]?.change || selectedMarket.priceChange || 0) >= 0 ? '+' : '')}{(priceData[selectedMarket.symbol]?.change || selectedMarket.priceChange || 0).toFixed(2)}%
            </div>
            
            {/* Live Price Chart - Quotex Style */}
            <div className="price-chart" style={{ 
              marginTop: '20px', 
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
              borderRadius: '12px', 
              padding: '15px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '10px',
                color: '#fff'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  📈 {selectedMarket.symbol} Live Chart
                </span>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  Real-time • 2s updates
                </span>
              </div>
              
              <svg width="100%" height="200" style={{ 
                background: 'linear-gradient(180deg, #0f3460 0%, #1a1a2e 100%)', 
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                {/* Grid Lines */}
                <defs>
                  <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="0.8" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
                
                {/* Chart content */}
                {priceHistory[selectedMarket.symbol] && priceHistory[selectedMarket.symbol].length > 1 ? (
                  <>
                    {/* Price Line */}
                    <polyline
                      fill="none"
                      stroke="#00ff88"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0px 0px 6px #00ff88)"
                      points={
                        priceHistory[selectedMarket.symbol]
                          .map((point, index) => {
                            const x = (index / (priceHistory[selectedMarket.symbol].length - 1)) * 95 + 2.5;
                            const prices = priceHistory[selectedMarket.symbol].map(p => p.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceRange = maxPrice - minPrice || 1;
                            const y = 180 - ((point.price - minPrice) / priceRange) * 160;
                            return `${x}%,${y}`;
                          })
                          .join(' ')
                      }
                    />
                    
                    {/* Gradient Fill */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#00ff88', stopOpacity:0.3}} />
                        <stop offset="100%" style={{stopColor:'#00ff88', stopOpacity:0.05}} />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#chartGradient)"
                      points={
                        priceHistory[selectedMarket.symbol]
                          .map((point, index) => {
                            const x = (index / (priceHistory[selectedMarket.symbol].length - 1)) * 95 + 2.5;
                            const prices = priceHistory[selectedMarket.symbol].map(p => p.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceRange = maxPrice - minPrice || 1;
                            const y = 180 - ((point.price - minPrice) / priceRange) * 160;
                            return `${x}%,${y}`;
                          })
                          .join(' ') + ' 97.5%,190 2.5%,190'
                      }
                    />
                    
                    {/* Current Price Indicator */}
                    {priceHistory[selectedMarket.symbol].length > 0 && (
                      <g>
                        <circle
                          cx="97.5%"
                          cy={(() => {
                            const lastPoint = priceHistory[selectedMarket.symbol][priceHistory[selectedMarket.symbol].length - 1];
                            const prices = priceHistory[selectedMarket.symbol].map(p => p.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceRange = maxPrice - minPrice || 1;
                            return 180 - ((lastPoint.price - minPrice) / priceRange) * 160;
                          })()}
                          r="6"
                          fill="#00ff88"
                          stroke="#1a1a2e"
                          strokeWidth="2"
                        />
                        <circle
                          cx="97.5%"
                          cy={(() => {
                            const lastPoint = priceHistory[selectedMarket.symbol][priceHistory[selectedMarket.symbol].length - 1];
                            const prices = priceHistory[selectedMarket.symbol].map(p => p.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceRange = maxPrice - minPrice || 1;
                            return 180 - ((lastPoint.price - minPrice) / priceRange) * 160;
                          })()}
                          r="3"
                          fill="#fff"
                        />
                      </g>
                    )}
                  </>
                ) : (
                  <>
                    {/* Loading state with animated pulse */}
                    <text x="50%" y="100" textAnchor="middle" fill="#666" fontSize="16" fontWeight="bold">
                      📊 Loading Chart Data...
                    </text>
                    <text x="50%" y="120" textAnchor="middle" fill="#888" fontSize="12">
                      Price history will appear in a few seconds
                    </text>
                    
                    {/* Animated pulse line */}
                    <line x1="10%" y1="100" x2="90%" y2="100" stroke="#00ff88" strokeWidth="2" opacity="0.5">
                      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite"/>
                    </line>
                  </>
                )}
                
                {/* Price Scale Labels */}
                {priceHistory[selectedMarket.symbol] && priceHistory[selectedMarket.symbol].length > 1 && (
                  <g>
                    {/* High Price */}
                    <text x="5" y="25" fill="#00ff88" fontSize="10" fontWeight="bold">
                      {formatCurrency(Math.max(...priceHistory[selectedMarket.symbol].map(p => p.price)))}
                    </text>
                    {/* Low Price */}
                    <text x="5" y="185" fill="#ff4757" fontSize="10" fontWeight="bold">
                      {formatCurrency(Math.min(...priceHistory[selectedMarket.symbol].map(p => p.price)))}
                    </text>
                  </g>
                )}
              </svg>
              
              {/* Chart Info */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px',
                fontSize: '11px',
                color: '#888'
              }}>
                <span>💹 Live Price Feed</span>
                <span>🔄 Auto-updating</span>
                <span>📊 Real-time Chart</span>
              </div>
            </div>
          </div>

          {/* Trade Controls */}
          <div className="trade-controls">
            <div className="amount-selector">
              <label>Trade Amount:</label>
              <input
                type="number"
                min={selectedMarket.minTradeAmount}
                max={Math.min(selectedMarket.maxTradeAmount, userBalance)}
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                className="amount-input"
              />
              <div className="amount-buttons">
                <button onClick={() => setTradeAmount(10)}>$10</button>
                <button onClick={() => setTradeAmount(50)}>$50</button>
                <button onClick={() => setTradeAmount(100)}>$100</button>
                <button onClick={() => setTradeAmount(500)}>$500</button>
              </div>
            </div>

            <div className="expiry-selector">
              <label>Expiry Time:</label>
              <select value={expiryTime} onChange={(e) => setExpiryTime(Number(e.target.value))}>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
              </select>
            </div>

            <div className="payout-info">
              <span>Potential Payout: {formatCurrency(tradeAmount + (tradeAmount * selectedMarket.payoutPercent / 100))}</span>
              <span>Return: {selectedMarket.payoutPercent}%</span>
            </div>
          </div>

          {/* Trade Buttons - Quotex Style */}
          <div className="trade-buttons">
            <button 
              className="trade-btn call-btn"
              onClick={() => placeTrade('CALL')}
              disabled={placing || tradeAmount > userBalance}
            >
              <div className="btn-content">
                <span className="btn-arrow">↗</span>
                <span className="btn-text">CALL</span>
                <span className="btn-subtitle">Higher</span>
              </div>
            </button>
            
            <button 
              className="trade-btn put-btn"
              onClick={() => placeTrade('PUT')}
              disabled={placing || tradeAmount > userBalance}
            >
              <div className="btn-content">
                <span className="btn-arrow">↘</span>
                <span className="btn-text">PUT</span>
                <span className="btn-subtitle">Lower</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <div className="active-trades">
          <h3>Active Trades</h3>
          <div className="trades-list">
            {activeTrades.map(trade => (
              <div key={trade._id} className="trade-item">
                <div className="trade-info">
                  <span className="trade-symbol">{trade.symbolName}</span>
                  <span className={`trade-type ${trade.tradeType.toLowerCase()}`}>
                    {trade.tradeType}
                  </span>
                  <span className="trade-amount">{formatCurrency(trade.tradeAmount)}</span>
                </div>
                <div className="trade-details">
                  <span className="entry-price">Entry: {formatCurrency(trade.entryPrice)}</span>
                  <span className="current-price">
                    Current: {formatCurrency(priceData[trade.symbol]?.price || 0)}
                  </span>
                  <span className="time-remaining">
                    {formatTimeRemaining(trade.tradeEndTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingInterface;