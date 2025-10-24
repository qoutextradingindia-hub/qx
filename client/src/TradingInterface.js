import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TradingInterface = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState({ symbol: 'AUDJPY', name: 'AUD/JPY', payoutPercent: 87 });
  const [tradeAmount, setTradeAmount] = useState(1);
  const [expiryTime, setExpiryTime] = useState(71);
  const [userBalance, setUserBalance] = useState(1000);
  const [candleData, setCandleData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(99.374);
  const [placing, setPlacing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const priceUpdateInterval = useRef(null);
  const chartRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_URL || 'https://qxtrand.onrender.com';

  // Generate realistic OHLC candlestick data
  const generateCandleData = () => {
    const now = Date.now();
    const candles = [];
    let price = 99.374; // Starting price like in Quotex
    
    // Generate 20 historical candles (30-second intervals)
    for (let i = 19; i >= 0; i--) {
      const timestamp = now - (i * 30000); // 30 seconds interval
      const variation = (Math.random() - 0.5) * 0.020; // ±0.020 variation
      
      const open = price;
      const close = price + variation;
      const high = Math.max(open, close) + Math.random() * 0.005;
      const low = Math.min(open, close) - Math.random() * 0.005;
      
      candles.push({
        timestamp,
        open: parseFloat(open.toFixed(3)),
        high: parseFloat(high.toFixed(3)), 
        low: parseFloat(low.toFixed(3)),
        close: parseFloat(close.toFixed(3)),
        isGreen: close > open
      });
      
      price = close; // Next candle starts from previous close
    }
    
    setCandleData(candles);
    setCurrentPrice(candles[candles.length - 1].close);
  };

  // Update price and candle data every 3 seconds
  const updatePriceData = () => {
    setCandleData(prevCandles => {
      const now = Date.now();
      const lastCandle = prevCandles[prevCandles.length - 1];
      const timeDiff = now - lastCandle.timestamp;
      
      // Create new candle every 30 seconds
      if (timeDiff >= 30000) {
        const variation = (Math.random() - 0.5) * 0.015;
        const newPrice = lastCandle.close + variation;
        
        const newCandle = {
          timestamp: now,
          open: lastCandle.close,
          close: parseFloat(newPrice.toFixed(3)),
          high: Math.max(lastCandle.close, newPrice) + Math.random() * 0.003,
          low: Math.min(lastCandle.close, newPrice) - Math.random() * 0.003,
          isGreen: newPrice > lastCandle.close
        };
        
        setCurrentPrice(newCandle.close);
        return [...prevCandles.slice(-19), newCandle]; // Keep last 20 candles
      } else {
        // Update current candle
        const variation = (Math.random() - 0.5) * 0.005;
        const newPrice = lastCandle.close + variation;
        const updatedCandles = [...prevCandles];
        const currentCandle = updatedCandles[updatedCandles.length - 1];
        
        updatedCandles[updatedCandles.length - 1] = {
          ...currentCandle,
          close: parseFloat(newPrice.toFixed(3)),
          high: Math.max(currentCandle.high, newPrice),
          low: Math.min(currentCandle.low, newPrice),
          isGreen: newPrice > currentCandle.open
        };
        
        setCurrentPrice(newPrice);
        return updatedCandles;
      }
    });
  };

  // Initialize on component mount
  useEffect(() => {
    generateCandleData();
    
    // Update price every 3 seconds
    priceUpdateInterval.current = setInterval(updatePriceData, 3000);
    
    // Update time every second
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

  // Place trade function
  const placeTrade = async (direction) => {
    setPlacing(true);
    console.log(`Placing ${direction} trade for ${tradeAmount}$ on ${selectedMarket.symbol}`);
    
    // Simulate trade placement
    setTimeout(() => {
      setPlacing(false);
      alert(`${direction} trade placed successfully! Entry: ${currentPrice}`);
    }, 1000);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#1a1a2e', // Quotex dark blue-black
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Header - Exact Quotex Style */}
      <div style={{
        backgroundColor: '#16213e',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a3441'
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '20px' }}>☰</div>
          <div style={{ 
            background: '#4CAF50', 
            color: '#000',
            padding: '2px 8px', 
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            🟢 LIVE ACCOUNT
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#FFFFFF'
          }}>
            ${userBalance.toFixed(2)}
          </div>
          <select style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '14px'
          }}>
            <option>▼</option>
          </select>
          <div style={{
            background: '#4CAF50',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Deposit
          </div>
          <div style={{ fontSize: '18px', marginLeft: '8px' }}>🚨</div>
        </div>

        {/* Right Side */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          color: '#888'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#4CAF50', 
            borderRadius: '50%' 
          }}></div>
          <span>{currentTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })} UTC+1</span>
          <span style={{ 
            background: '#2196F3',
            color: '#FFF',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px'
          }}>ℹ</span>
        </div>
      </div>

      {/* Main Chart Area - Quotex Style */}
      <div style={{ 
        flex: 1,
        backgroundColor: '#1a1a2e',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Chart Container */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: '#1a1a2e',
          display: 'flex'
        }}>
          
          {/* Main Chart Area */}
          <div style={{ 
            flex: 1, 
            position: 'relative',
            minHeight: '400px'
          }}>
            <svg 
              width="100%" 
              height="100%" 
              style={{ backgroundColor: '#1a1a2e' }}
              viewBox="0 0 800 400"
            >
              {/* Subtle Grid - Quotex Style */}
              <defs>
                <pattern id="quotexGrid" width="40" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a3441" strokeWidth="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#quotexGrid)" />
              
              {/* Professional Candlesticks - Enhanced */}
              {candleData.map((candle, index) => {
                const x = 50 + (index * 30); // Tighter spacing like Quotex
                const chartHeight = 350;
                const priceRange = Math.max(...candleData.map(c => c.high)) - Math.min(...candleData.map(c => c.low));
                const minPrice = Math.min(...candleData.map(c => c.low));
                
                // Scale prices to chart height
                const scalePrice = (price) => chartHeight - ((price - minPrice) / priceRange) * chartHeight + 25;
                
                const openY = scalePrice(candle.open);
                const closeY = scalePrice(candle.close);
                const highY = scalePrice(candle.high);
                const lowY = scalePrice(candle.low);
                
                const isGreen = candle.close > candle.open;
                const candleColor = isGreen ? '#4CAF50' : '#FF5252';
                const bodyHeight = Math.abs(closeY - openY);
                const bodyTop = Math.min(openY, closeY);
                
                return (
                  <g key={index}>
                    {/* High-Low line (wick) */}
                    <line 
                      x1={x} 
                      y1={highY} 
                      x2={x} 
                      y2={lowY} 
                      stroke={candleColor} 
                      strokeWidth="1"
                    />
                    
                    {/* Candle body - Quotex style */}
                    <rect
                      x={x - 6}
                      y={bodyTop}
                      width="12"
                      height={Math.max(bodyHeight, 1)} 
                      fill={isGreen ? '#4CAF50' : '#FF5252'}
                      stroke={candleColor}
                      strokeWidth="1"
                      rx="1"
                    />
                  </g>
                );
              })}
              
              {/* Current Price Line - Quotex Style */}
              <line 
                x1="50" 
                y1={350 - ((currentPrice - Math.min(...candleData.map(c => c.low))) / 
                  (Math.max(...candleData.map(c => c.high)) - Math.min(...candleData.map(c => c.low)))) * 350 + 25} 
                x2="750" 
                y2={350 - ((currentPrice - Math.min(...candleData.map(c => c.low))) / 
                  (Math.max(...candleData.map(c => c.high)) - Math.min(...candleData.map(c => c.low)))) * 350 + 25}
                stroke="#FFC107" 
                strokeWidth="1" 
                strokeDasharray="2,2"
              />
              
              {/* Time axis labels - Quotex format */}
              {candleData.filter((_, i) => i % 5 === 0).map((candle, index) => (
                <text 
                  key={index}
                  x={50 + (index * 5 * 30)} 
                  y="390" 
                  fill="#666" 
                  fontSize="9" 
                  textAnchor="middle"
                >
                  {new Date(candle.timestamp).toLocaleTimeString('en-US', { 
                    hour12: false, 
                    minute: '2-digit' 
                  })}
                </text>
              ))}
            </svg>
          </div>
          
          {/* Price Scale - Quotex Style */}
          <div style={{
            width: '60px',
            backgroundColor: '#1a1a2e',
            borderLeft: '1px solid #2a3441',
            padding: '20px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {candleData.length > 0 && (() => {
              const maxPrice = Math.max(...candleData.map(c => c.high));
              const minPrice = Math.min(...candleData.map(c => c.low));
              const priceSteps = 8;
              const priceStep = (maxPrice - minPrice) / priceSteps;
              
              return Array.from({ length: priceSteps + 1 }, (_, i) => {
                const price = maxPrice - (i * priceStep);
                const isCurrentPrice = Math.abs(price - currentPrice) < priceStep / 2;
                return (
                  <div 
                    key={i}
                    style={{
                      fontSize: '10px',
                      color: isCurrentPrice ? '#FFC107' : '#666',
                      textAlign: 'right',
                      fontWeight: isCurrentPrice ? 'bold' : 'normal'
                    }}
                  >
                    {price.toFixed(3)}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Bottom Trading Panel - Exact Quotex Style */}
      <div style={{ 
        backgroundColor: '#16213e',
        padding: '12px 16px',
        borderTop: '1px solid #2a3441'
      }}>
        
        {/* Symbol Row - With Flags */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '12px',
          gap: '8px'
        }}>
          <div style={{ fontSize: '18px' }}>🇦🇺🇯🇵</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#FFFFFF'
          }}>
            AUD/JPY
          </div>
          <div style={{ 
            background: '#FF9800', 
            color: '#000', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            87%
          </div>
          <select style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '12px'
          }}>
            <option>▼</option>
          </select>
          
          {/* PENDING TRADE indicator */}
          <div style={{ 
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#2196F3'
          }}>
            <div style={{
              background: '#2196F3',
              borderRadius: '50%',
              width: '8px',
              height: '8px'
            }}></div>
            PENDING TRADE
          </div>
        </div>

        {/* Controls Row */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          
          {/* Time */}
          <div>
            <div style={{ 
              fontSize: '11px', 
              color: '#888', 
              marginBottom: '4px' 
            }}>
              Time
            </div>
            <input
              type="text"
              value="11:43"
              readOnly
              style={{
                background: '#2a3441',
                border: '1px solid #3d4a5c',
                borderRadius: '4px',
                padding: '6px 8px',
                color: '#FFFFFF',
                width: '60px',
                textAlign: 'center',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Investment */}
          <div>
            <div style={{ 
              fontSize: '11px', 
              color: '#888', 
              marginBottom: '4px' 
            }}>
              Investment
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                style={{
                  background: '#2a3441',
                  border: '1px solid #3d4a5c',
                  borderRadius: '4px 0 0 4px',
                  padding: '6px 8px',
                  color: '#FFFFFF',
                  width: '50px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}
              />
              <div style={{ 
                background: '#3d4a5c', 
                padding: '6px 8px', 
                borderRadius: '0 4px 4px 0',
                fontSize: '12px',
                color: '#FFFFFF'
              }}>$</div>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                marginLeft: '8px',
                cursor: 'pointer'
              }}>+</button>
            </div>
            <div style={{ 
              fontSize: '9px', 
              color: '#2196F3', 
              marginTop: '2px',
              textAlign: 'center'
            }}>
              SWITCH
            </div>
          </div>

          {/* Payout */}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ 
              fontSize: '11px', 
              color: '#888',
              marginBottom: '2px'
            }}>
              Payout:
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#4CAF50' 
            }}>
              1.87$
            </div>
          </div>
        </div>

        {/* Trade Buttons - Exact Quotex Style */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => placeTrade('PUT')}
            disabled={placing}
            style={{
              flex: 1,
              padding: '12px',
              background: placing ? '#555' : 'linear-gradient(135deg, #FF5252, #E53935)',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: placing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ fontSize: '16px' }}>↓</span>
            Down
          </button>
          
          <button
            onClick={() => placeTrade('CALL')}
            disabled={placing}
            style={{
              flex: 1,
              padding: '12px',
              background: placing ? '#555' : 'linear-gradient(135deg, #4CAF50, #43A047)',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              cursor: placing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ fontSize: '16px' }}>↑</span>
            Up
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Exact Quotex Icons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#16213e',
        borderTop: '1px solid #2a3441'
      }}>
        {[
          { icon: '📊', active: true },
          { icon: '❓', notification: true },
          { icon: '👤', active: false },
          { icon: '💬', notification: true, count: 4 },
          { icon: '⚙️', active: false }
        ].map((item, index) => (
          <div key={index} style={{
            padding: '8px',
            fontSize: '20px',
            opacity: item.active ? 1 : 0.6,
            position: 'relative',
            cursor: 'pointer'
          }}>
            {item.icon}
            {item.notification && (
              <div style={{
                position: 'absolute',
                background: item.count ? '#2196F3' : '#FF5252',
                borderRadius: '50%',
                width: item.count ? '16px' : '8px',
                height: item.count ? '16px' : '8px',
                top: '4px',
                right: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#FFF'
              }}>
                {item.count || ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingInterface;