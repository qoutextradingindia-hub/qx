// STAR TRADER Dashboard - Polmax style, all options same as Polmax
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import logo from './assets/logo.png';

function Dashboard() {
  return (
    <div className="dashboard-main-container">
      {/* Header - Polmax style, pink/purple background, small logo, STAR TRADER name */}
      <div className="dashboard-header polmax-header">
        <img src={logo} alt="Star Trader Logo" className="dashboard-logo polmax-logo" />
        <span className="dashboard-title polmax-title">STAR TRADER</span>
      </div>
      {/* Menu Bar - Polmax style, pink/purple menu */}
      <nav className="dashboard-menu polmax-menu">
        <Link to="/dashboard" className="dashboard-menu-item polmax-menu-item">DASHBOARD</Link>
        <Link to="/binary-trading" className="dashboard-menu-item polmax-menu-item" style={{ 
          background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
          color: '#000', 
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          position: 'relative'
        }}>
          📊 BINARY TRADING
          <span style={{ 
            position: 'absolute', 
            top: '-5px', 
            right: '-5px', 
            background: '#ff4757', 
            color: 'white', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            fontSize: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>NEW</span>
        </Link>
        <Link to="/staking" className="dashboard-menu-item polmax-menu-item">INVEST</Link>
        <div className="dashboard-menu-item polmax-menu-item">AI BOT</div>
        <div className="dashboard-menu-item polmax-menu-item">PAYMENTS</div>
        <Link to="/referral" className="dashboard-menu-item polmax-menu-item">REFERRALS</Link>
        <Link to="/earning" className="dashboard-menu-item polmax-menu-item">PROFIT</Link>
        <Link to="/reward" className="dashboard-menu-item polmax-menu-item">SIGNUP REWARD</Link>
        <Link to="/support" className="dashboard-menu-item polmax-menu-item">SUPPORT</Link>
        <div className="dashboard-menu-item polmax-menu-item">LOGOUT</div>
      </nav>
      {/* Refer & Earn Section */}
      <div className="dashboard-section dashboard-refer-earn">
        <div className="dashboard-refer-title">Refer & Earn</div>
        <input className="dashboard-refer-link" value="https://startraders.com/registration?ref=474181" readOnly />
        <div className="dashboard-refer-socials">
          <button className="dashboard-social-btn">FB</button>
          <button className="dashboard-social-btn">WA</button>
        </div>
        <div className="dashboard-media-link">
          <button className="dashboard-social-btn">INSTA</button>
          <button className="dashboard-social-btn">WA</button>
        </div>
      </div>

      {/* 🎯 NEW: Binary Trading Quick Access Card */}
      <div className="dashboard-section" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '15px', 
        padding: '20px', 
        margin: '20px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Binary Trading Platform</h2>
        <p style={{ margin: '0 0 20px 0', opacity: '0.9' }}>Trade cryptocurrencies, forex & indices with 30-second to 10-minute expiry times</p>
        <Link to="/binary-trading" style={{
          display: 'inline-block',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          color: '#000',
          padding: '12px 30px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
          transition: 'transform 0.3s ease'
        }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
          🚀 START TRADING NOW
        </Link>
        <div style={{ marginTop: '15px', fontSize: '14px', opacity: '0.8' }}>
          ✅ Live prices • ✅ Instant results • ✅ 80%+ payout
        </div>
      </div>
      {/* My Referral & My Business Section */}
      <div className="dashboard-section dashboard-referral-business">
        <div className="dashboard-referral-group">
          <div className="dashboard-referral-box">DOWNLINE<br />0</div>
          <div className="dashboard-referral-box">ACTIVE DOWNLINE<br />0</div>
          <div className="dashboard-referral-box">REFERRALS<br />TOTAL 0 | ACTIVE 0</div>
        </div>
        <div className="dashboard-business-group">
          <div className="dashboard-business-box">SELF TOPUP<br />$0</div>
          <div className="dashboard-business-box">DIRECT<br />$0</div>
          <div className="dashboard-business-box">DOWNLINE<br />$0</div>
        </div>
      </div>
      {/* Rewards & Profits Section */}
      <div className="dashboard-section dashboard-rewards-profits">
        <div className="dashboard-reward-box">SIGN UP REWARD<br />$0</div>
        <div className="dashboard-reward-box">SIGN UP LEVEL<br />$0</div>
        <div className="dashboard-reward-box">TRADING PROFIT<br />$0</div>
        <div className="dashboard-reward-box">REFERRAL PROFIT<br />$0</div>
        <div className="dashboard-reward-box">LEVEL PROFIT<br />$0</div>
        <div className="dashboard-reward-box">RANK PROFIT<br />$0<br /><button className="dashboard-status-btn">View Status</button></div>
      </div>
      {/* Wallet Section */}
      <div className="dashboard-section dashboard-wallet">
        <div className="dashboard-wallet-title">Your wallet</div>
        <div className="dashboard-wallet-desc">here you will check wallet transactions.</div>
        <div className="dashboard-wallet-group">
          <div className="dashboard-wallet-box">DEPOSIT WALLET<br />$0</div>
          <div className="dashboard-wallet-box">SIGNUP WALLET<br />$0</div>
          <div className="dashboard-wallet-box">INCOME WALLET<br />$0</div>
        </div>
        <div className="dashboard-wallet-actions">
          <button className="dashboard-wallet-btn">Deposit</button>
          <button className="dashboard-wallet-btn">Withdraw</button>
        </div>
      </div>
      {/* Footer */}
      <footer className="dashboard-footer">
        2025 - 2026 © Client dashboard by STAR TRADER
      </footer>
    </div>
  );
}

export default Dashboard;





