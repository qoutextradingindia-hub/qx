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
            updatedPrices[market.symbol] = {
              price: market.currentPrice,
              change: market.priceChange
            };
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