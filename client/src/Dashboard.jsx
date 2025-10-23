// STAR TRADER Dashboard - Polmax style, all options same as Polmax
import React from 'react';
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
        <div className="dashboard-menu-item polmax-menu-item">DASHBOARD</div>
        <div className="dashboard-menu-item polmax-menu-item">INVEST</div>
        <div className="dashboard-menu-item polmax-menu-item">AI BOT</div>
        <div className="dashboard-menu-item polmax-menu-item">PAYMENTS</div>
        <div className="dashboard-menu-item polmax-menu-item">REFERRALS</div>
        <div className="dashboard-menu-item polmax-menu-item">PROFIT</div>
        <div className="dashboard-menu-item polmax-menu-item">SIGNUP REWARD</div>
        <div className="dashboard-menu-item polmax-menu-item">SUPPORT</div>
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





