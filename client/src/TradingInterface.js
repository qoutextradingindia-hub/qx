import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TradingInterface.css';

const TradingInterface = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [expiryTime, setExpiryTime] = useState(60);
  const [activeTrades, setActiveTrades] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [priceData, setPriceData] = useState({});
  const [candleData, setCandleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [tradeStartTime, setTradeStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const priceUpdateInterval = useRef(null);
  const API_BASE = process.env.REACT_APP_API_URL || 'https://qxtrand.onrender.com';

  // Load markets and user data on component mount
  useEffect(() => {
    fetchMarkets();
    fetchActiveTrades();
    fetchUserBalance();
    startPriceUpdates();
    initializeCandleData();
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      if (priceUpdateInterval.current) {
        clearInterval(priceUpdateInterval.current);
      }
      clearInterval(timeInterval);
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

  // Initialize candlestick data
  const initializeCandleData = () => {
    const now = Date.now();
    const initialCandles = [];
    
    // Generate initial 20 candles with realistic data
    for (let i = 20; i >= 0; i--) {
      const time = now - (i * 60000); // 1 minute intervals
      const basePrice = 99.350;
      const randomChange = (Math.random() - 0.5) * 0.050;
      const open = basePrice + randomChange;
      const close = open + (Math.random() - 0.5) * 0.020;
      const high = Math.max(open, close) + Math.random() * 0.010;
      const low = Math.min(open, close) - Math.random() * 0.010;
      
      initialCandles.push({
        time,
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(high.toFixed(4)),
        low: parseFloat(low.toFixed(4)),
        close: parseFloat(close.toFixed(4)),
        volume: Math.random() * 1000 + 500
      });
    }
    
    setCandleData(initialCandles);
  };

  // Update candlestick data
  const updateCandleData = (newPrice) => {
    setCandleData(prevCandles => {
      const now = Date.now();
      const lastCandle = prevCandles[prevCandles.length - 1];
      const oneMinute = 60000;
      
      if (now - lastCandle.time >= oneMinute) {
        // Create new candle
        const newCandle = {
          time: now,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, newPrice),
          low: Math.min(lastCandle.close, newPrice),
          close: newPrice,
          volume: Math.random() * 1000 + 500
        };
        
        return [...prevCandles.slice(-19), newCandle]; // Keep last 20 candles
      } else {
        // Update current candle
        const updatedCandles = [...prevCandles];
        const currentCandle = updatedCandles[updatedCandles.length - 1];
        updatedCandles[updatedCandles.length - 1] = {
          ...currentCandle,
          high: Math.max(currentCandle.high, newPrice),
          low: Math.min(currentCandle.low, newPrice),
          close: newPrice
        };
        
        return updatedCandles;
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
            
            // Update candlestick data for selected market
            if (selectedMarket && market.symbol === selectedMarket.symbol) {
              updateCandleData(newPrice);
            }
          });
          setPriceData(updatedPrices);
        }
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 2000); // Update every 2 seconds
  };
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
    <div className="quotex-trading-interface" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            background: '#4CAF50', 
            padding: '5px 10px', 
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            🟢 LIVE ACCOUNT
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ${userBalance.toFixed(2)}
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          🕐 {currentTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })} UTC+1
        </div>
      </div>

      {/* Main Trading Area */}
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        
        {/* Chart Area */}
        <div style={{ 
          flex: '1', 
          padding: '20px',
          background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)'
        }}>
          {selectedMarket ? (
            <>
              {/* Market Info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🇦🇺🇯🇵</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {selectedMarket.symbol}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: selectedMarket.payoutPercent >= 80 ? '#4CAF50' : '#FFC107'
                    }}>
                      {selectedMarket.payoutPercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Candlestick Chart */}
              <div style={{
                background: '#0a0a0a',
                borderRadius: '10px',
                padding: '15px',
                height: '400px',
                position: 'relative',
                border: '1px solid #333'
              }}>
                {/* Chart Grid and Candles */}
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#222" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
                  
                  {/* Price Scale Lines */}
                  {[...Array(8)].map((_, i) => {
                    const y = (i + 1) * 45;
                    const price = candleData.length > 0 ? 
                      (Math.min(...candleData.map(c => c.low)) + 
                       (Math.max(...candleData.map(c => c.high)) - Math.min(...candleData.map(c => c.low))) * 
                       (1 - i / 7)).toFixed(3) : '99.350';
                    return (
                      <g key={i}>
                        <line x1="0" y1={y} x2="100%" y2={y} stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
                        <text x="98%" y={y - 5} fill="#888" fontSize="12" textAnchor="end">
                          {price}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Time Markers */}
                  {candleData.slice(-10).map((candle, index) => {
                    const x = (index / 9) * 90 + 5;
                    const time = new Date(candle.time).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    return (
                      <text 
                        key={index} 
                        x={`${x}%`} 
                        y="95%" 
                        fill="#888" 
                        fontSize="10" 
                        textAnchor="middle"
                      >
                        {time}
                      </text>
                    );
                  })}
                  
                  {/* Candlesticks */}
                  {candleData.slice(-10).map((candle, index) => {
                    if (candleData.length === 0) return null;
                    
                    const x = (index / 9) * 90 + 5;
                    const minPrice = Math.min(...candleData.map(c => c.low));
                    const maxPrice = Math.max(...candleData.map(c => c.high));
                    const priceRange = maxPrice - minPrice;
                    
                    const highY = 85 - ((candle.high - minPrice) / priceRange) * 70;
                    const lowY = 85 - ((candle.low - minPrice) / priceRange) * 70;
                    const openY = 85 - ((candle.open - minPrice) / priceRange) * 70;
                    const closeY = 85 - ((candle.close - minPrice) / priceRange) * 70;
                    
                    const isGreen = candle.close > candle.open;
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.abs(closeY - openY);
                    
                    return (
                      <g key={index}>
                        {/* Wick */}
                        <line
                          x1={`${x}%`}
                          y1={`${highY}%`}
                          x2={`${x}%`}
                          y2={`${lowY}%`}
                          stroke={isGreen ? '#4CAF50' : '#F44336'}
                          strokeWidth="1"
                        />
                        {/* Body */}
                        <rect
                          x={`${x - 1.5}%`}
                          y={`${bodyTop}%`}
                          width="3%"
                          height={`${Math.max(bodyHeight, 0.5)}%`}
                          fill={isGreen ? '#4CAF50' : '#F44336'}
                          stroke={isGreen ? '#4CAF50' : '#F44336'}
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Trade Start/End Markers */}
                  {tradeStartTime && (
                    <>
                      <line x1="20%" y1="10%" x2="20%" y2="90%" stroke="#FFC107" strokeWidth="2" strokeDasharray="5,5"/>
                      <text x="20%" y="8%" fill="#FFC107" fontSize="10" textAnchor="middle">
                        Beginning of trade
                      </text>
                      <line x1="80%" y1="10%" x2="80%" y2="90%" stroke="#FFC107" strokeWidth="2" strokeDasharray="5,5"/>
                      <text x="80%" y="8%" fill="#FFC107" fontSize="10" textAnchor="middle">
                        End of trade
                      </text>
                    </>
                  )}
                </svg>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              paddingTop: '100px',
              color: '#888'
            }}>
              Select a market to start trading
            </div>
          )}
        </div>

        {/* Trading Panel */}
        <div style={{ 
          width: '300px', 
          background: 'rgba(0,0,0,0.4)',
          padding: '20px',
          borderLeft: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Market Selector */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Markets</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {markets.map(market => (
                <div 
                  key={market.symbol}
                  onClick={() => setSelectedMarket(market)}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: selectedMarket?.symbol === market.symbol ? 
                      'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    border: selectedMarket?.symbol === market.symbol ? 
                      '1px solid #4CAF50' : '1px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {market.symbol}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {market.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Controls */}
          {selectedMarket && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  Time
                </label>
                <input
                  type="number"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  Investment
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#888' }}>Payout:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {(tradeAmount * (selectedMarket.payoutPercent / 100 + 1)).toFixed(2)}$
                </div>
              </div>

              {/* Call/Put Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => placeTrade('PUT')}
                  disabled={placing}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: placing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>↓</span>
                  Down
                </button>
                
                <button
                  onClick={() => placeTrade('CALL')}
                  disabled={placing}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: placing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>↑</span>
                  Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;