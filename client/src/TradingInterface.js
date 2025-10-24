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
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Bar - Quotex Style */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 15px',
        background: '#1a1a1a',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: '#4CAF50', 
            padding: '3px 8px', 
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            🟢 LIVE ACCOUNT
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            ${userBalance.toFixed(2)}
          </div>
          <button style={{
            background: '#4CAF50',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Deposit
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', background: '#4CAF50', borderRadius: '50%' }}></div>
          {currentTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })} UTC+1
          <span style={{ fontSize: '14px', marginLeft: '10px' }}>ℹ️</span>
        </div>
      </div>

      {/* Main Chart Area - Full Width */}
      <div style={{ 
        flex: 1,
        background: '#0f0f0f',
        position: 'relative',
        height: '60vh'
      }}>
        {selectedMarket && (
          <>
            {/* Chart Container */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '10px'
            }}>
              {/* Professional Candlestick Chart - Quotex Style */}
              <svg width="100%" height="100%" style={{ background: '#0a0a0a' }}>
                {/* Horizontal Grid Lines */}
                {[...Array(8)].map((_, i) => {
                  const y = (i + 1) * 12.5;
                  const price = candleData.length > 0 ? 
                    (Math.min(...candleData.map(c => c.low)) + 
                     (Math.max(...candleData.map(c => c.high)) - Math.min(...candleData.map(c => c.low))) * 
                     (1 - i / 7)).toFixed(3) : (99.300 + i * 0.010).toFixed(3);
                  return (
                    <g key={i}>
                      <line 
                        x1="0" 
                        y1={`${y}%`} 
                        x2="100%" 
                        y2={`${y}%`} 
                        stroke="#1a1a1a" 
                        strokeWidth="1"
                      />
                      <text 
                        x="96%" 
                        y={`${y - 1}%`} 
                        fill="#666" 
                        fontSize="11" 
                        textAnchor="end"
                      >
                        {price}
                      </text>
                    </g>
                  );
                })}
                
                {/* Vertical Grid Lines */}
                {[...Array(12)].map((_, i) => {
                  const x = (i + 1) * 8.33;
                  return (
                    <line 
                      key={i}
                      x1={`${x}%`} 
                      y1="0" 
                      x2={`${x}%`} 
                      y2="100%" 
                      stroke="#1a1a1a" 
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Time Labels at Bottom */}
                {candleData.slice(-6).map((candle, index) => {
                  const x = 20 + (index * 15);
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
                      fill="#666" 
                      fontSize="10" 
                      textAnchor="middle"
                    >
                      {time}
                    </text>
                  );
                })}
                
                {/* Professional Candlesticks */}
                {candleData.slice(-20).map((candle, index) => {
                  if (candleData.length === 0) return null;
                  
                  const x = 10 + (index * 4);
                  const minPrice = Math.min(...candleData.map(c => c.low));
                  const maxPrice = Math.max(...candleData.map(c => c.high));
                  const priceRange = maxPrice - minPrice || 0.001;
                  
                  const highY = 15 + ((maxPrice - candle.high) / priceRange) * 70;
                  const lowY = 15 + ((maxPrice - candle.low) / priceRange) * 70;
                  const openY = 15 + ((maxPrice - candle.open) / priceRange) * 70;
                  const closeY = 15 + ((maxPrice - candle.close) / priceRange) * 70;
                  
                  const isGreen = candle.close > candle.open;
                  const bodyTop = Math.min(openY, closeY);
                  const bodyHeight = Math.abs(closeY - openY) || 0.5;
                  
                  return (
                    <g key={index}>
                      {/* Candle Wick */}
                      <line
                        x1={`${x}%`}
                        y1={`${highY}%`}
                        x2={`${x}%`}
                        y2={`${lowY}%`}
                        stroke={isGreen ? '#4CAF50' : '#F44336'}
                        strokeWidth="1"
                      />
                      {/* Candle Body */}
                      <rect
                        x={`${x - 1}%`}
                        y={`${bodyTop}%`}
                        width="2%"
                        height={`${bodyHeight}%`}
                        fill={isGreen ? '#4CAF50' : '#F44336'}
                        stroke={isGreen ? '#4CAF50' : '#F44336'}
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
                
                {/* Trade Start/End Markers - Quotex Style */}
                <g>
                  <line x1="25%" y1="10%" x2="25%" y2="85%" stroke="#FFC107" strokeWidth="2" strokeDasharray="3,3"/>
                  <text x="25%" y="8%" fill="#FFC107" fontSize="9" textAnchor="middle">
                    Beginning of trade
                  </text>
                  <line x1="75%" y1="10%" x2="75%" y2="85%" stroke="#FFC107" strokeWidth="2" strokeDasharray="3,3"/>
                  <text x="75%" y="8%" fill="#FFC107" fontSize="9" textAnchor="middle">
                    End of trade
                  </text>
                  <text x="50%" y="92%" fill="#FFC107" fontSize="9" textAnchor="middle">
                    00:46
                  </text>
                </g>
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Bottom Trading Panel - Quotex Style */}
      <div style={{ 
        background: '#1a1a1a',
        padding: '15px',
        borderTop: '1px solid #333'
      }}>
        {/* Symbol Selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>🇦🇺🇯🇵</span>
          <select 
            value={selectedMarket?.symbol || ''}
            onChange={(e) => {
              const market = markets.find(m => m.symbol === e.target.value);
              setSelectedMarket(market);
            }}
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '5px',
              padding: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {markets.map(market => (
              <option key={market.symbol} value={market.symbol}>
                {market.symbol}
              </option>
            ))}
          </select>
          <div style={{ 
            background: '#FF9800', 
            color: 'black', 
            padding: '3px 8px', 
            borderRadius: '3px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {selectedMarket?.payoutPercent || 87}%
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
            PENDING TRADE 🔵
          </div>
        </div>

        {/* Trade Controls Row */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          {/* Time */}
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Time</div>
            <input
              type="text"
              value={`${Math.floor(expiryTime / 60)}:${(expiryTime % 60).toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [min, sec] = e.target.value.split(':');
                setExpiryTime(parseInt(min) * 60 + parseInt(sec || 0));
              }}
              style={{
                background: '#333',
                border: '1px solid #555',
                borderRadius: '5px',
                padding: '8px',
                color: 'white',
                width: '80px',
                textAlign: 'center'
              }}
            />
          </div>

          {/* Investment */}
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Investment</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                style={{
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '5px 0 0 5px',
                  padding: '8px',
                  color: 'white',
                  width: '60px',
                  textAlign: 'center'
                }}
              />
              <span style={{ 
                background: '#555', 
                padding: '8px 10px', 
                borderRadius: '0 5px 5px 0',
                fontSize: '14px'
              }}>$</span>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                marginLeft: '10px'
              }}>+</button>
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              SWITCH
            </div>
          </div>

          {/* Payout */}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Payout:</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>
              {((tradeAmount * (selectedMarket?.payoutPercent || 87)) / 100 + tradeAmount).toFixed(2)}$
            </div>
          </div>
        </div>

        {/* Call/Put Buttons - Quotex Style */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => placeTrade('PUT')}
            disabled={placing}
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #F44336, #D32F2F)',
              border: 'none',
              borderRadius: '8px',
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
            <span style={{ fontSize: '18px' }}>↓</span>
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
              borderRadius: '8px',
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
            <span style={{ fontSize: '18px' }}>↑</span>
            Up
          </button>
        </div>
      </div>

      {/* Bottom Navigation Icons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px',
        background: '#0a0a0a',
        borderTop: '1px solid #333'
      }}>
        {['📊', '❓', '👤', '💬', '⚙️'].map((icon, index) => (
          <div key={index} style={{
            padding: '10px',
            fontSize: '20px',
            opacity: index === 0 ? 1 : 0.5
          }}>
            {icon}
            {index === 1 && <span style={{
              position: 'absolute',
              background: '#2196F3',
              borderRadius: '50%',
              width: '8px',
              height: '8px',
              marginLeft: '-5px',
              marginTop: '-5px'
            }}></span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingInterface;