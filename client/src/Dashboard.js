import React, { useState } from 'react';
import BoostingTimer from './BoostingTimer';
import UniversalResponsiveLayout from './UniversalResponsiveLayout';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaRobot, FaGift, FaExchangeAlt, FaUserPlus, FaChartLine, FaMoneyBill, FaHeadphones, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import logo from './assets/logo.png';
import './Dashboard.css';
import axios from 'axios';
import Sidebar from './components/SideBar';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // default बंद (sidebar बंद)
  const navigate = useNavigate();
  const menuItems = [
    { label: 'Dashboard', icon: <FaChartLine /> },
    { label: 'Invest', icon: <FaMoneyBill /> },
    { label: 'AI Bot', icon: <FaRobot /> },
    { label: 'Payments', icon: <FaExchangeAlt /> },
    { label: 'Referrals', icon: <FaUsers /> },
    { label: 'Profit', icon: <FaGift /> },
    { label: 'Signup Reward', icon: <FaUserPlus /> },
    { label: 'Support', icon: <FaHeadphones /> },
    { label: 'Logout', icon: <FaSignOutAlt /> }
  ];

  // Responsive mobile detection using state and resize event
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  // Wallet balances
  const [availableFunds, setAvailableFunds] = useState(0);
  const [referralIncome, setReferralIncome] = useState(0);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Fetch wallet balances on mount
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;
    // Available Funds (get user balance from admin API)
    axios
      .get(`https://qx-yb3z.onrender.com/api/admin/user/${user._id}`)
      .then(res => {
        if (res.data.success && res.data.user && typeof res.data.user.balance === 'number') {
          setAvailableFunds(res.data.user.balance);
        } else {
          setAvailableFunds(0);
        }
      })
      .catch(() => setAvailableFunds(0));
    // Referral Income
    axios
      .get(`https://qx-yb3z.onrender.com/api/user/referral-income/${user._id}`)
      .then(res => {
        if (res.data.success && typeof res.data.totalReferralIncome === 'string') {
          setReferralIncome(parseFloat(res.data.totalReferralIncome));
        } else if (res.data.success && typeof res.data.totalReferralIncome === 'number') {
          setReferralIncome(res.data.totalReferralIncome);
        } else {
          setReferralIncome(0);
        }
      })
      .catch(() => setReferralIncome(0));
  }, []);

  // Get user and referralCode safely
  const user = JSON.parse(localStorage.getItem('user'));
  const referralCode = user && user.referralCode ? user.referralCode : '';
  const referralLink = referralCode ? `https://qxtrand.onrender.com/register?ref=${referralCode}` : '';

  // Copy referral link to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!referralCode) {
      alert('Referral code missing. Please login again.');
      return;
    }
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <UniversalResponsiveLayout>
      {/* Hamburger/Menu button for sidebar toggle (left top) */}
      <button
        className="sidebar-hamburger"
        style={{position:'fixed',top:18,right:18,zIndex:1000,background:'none',border:'none',cursor:'pointer'}}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span style={{fontSize:'2rem',color:'#444'}}>&#9776;</span>
      </button>
      {/* Sidebar only opens when sidebarOpen is true */}
      {sidebarOpen && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} position="right" />}
      {/* Header with Star Traders logo and brand name, Polmax style */}
      <div style={{width:'100%',background:'#8c4be7',display:'flex',alignItems:'center',padding:'0 0 0 24px',height:'64px',boxShadow:'0 2px 8px rgba(140,75,231,0.08)'}}>
        <img src={logo} alt="Star Traders Logo" style={{height:'40px',marginRight:'16px'}} />
        <span style={{color:'#fff',fontWeight:700,fontSize:'2rem',letterSpacing:'1px'}}>STAR TRADERS</span>
      </div>

      {/* Boosting Block - above Refer & Earn */}
      <BoostingTimer userId={user._id} />

      {/* Dashboard Content below header */}
      <div className="dashboard-polmax" style={{marginLeft: sidebarOpen ? '260px' : '0',transition:'margin-left 0.3s'}}>
        {/* Refer & Earn - logo and black box removed as requested */}
        <div className="refer-earn-box">
          <div className="refer-title">Refer & Earn</div>
          <div className="refer-link-row">
            <input className="refer-link-input" type="text" value={referralLink} readOnly placeholder="Referral link will appear here" />
            <button
              className="refer-copy-btn"
              onClick={handleCopy}
              style={{background:'#8c4be7',color:'#fff'}}
              disabled={!referralCode}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="refer-btn-row">
            <a href="https://t.me/startraderssupport" target="_blank" rel="noopener noreferrer">
              <button className="refer-btn" style={{background:'#8c4be7',color:'#fff'}}>Telegram Support</button>
            </a>
          </div>
        </div>

        {/* Grid Section */}
        {/* ...existing code... */}
        <div className="dashboard-grid">
          <div className="grid-left">
            <div className="grid-row">
              <div className="grid-box clickable" onClick={() => navigate('/trading')}>
                <FaChartLine style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span>TRADING INCOME</span><span>$0</span>
              </div>
              <div className="grid-box clickable" onClick={() => navigate('/referral-income')}>
                <FaUsers style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span>DIRECT REFERRAL INCOME</span><span>$0</span>
              </div>
            </div>
            <div className="grid-row">
              <div className="grid-box clickable" onClick={() => navigate('/referral-on-trading')}>
                <FaExchangeAlt style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span>TRADING INCOME ON REFERRAL INCOME</span><span>$0</span>
              </div>
              <div className="grid-box clickable" onClick={() => navigate('/reward')}>
                <FaGift style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span>REWARD INCOME</span><span>$0</span>
              </div>
            </div>
            <div className="grid-row">
              <div className="grid-box clickable" onClick={() => navigate('/salary-income')}>
                <FaMoneyBill style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span>SALARY INCOME</span><span>$0</span>
              </div>
              <div className="grid-box clickable" style={{border:'1.5px dashed #8c4be7', borderRadius:'12px', background:'#f7f8fa', color:'#8c4be7', fontWeight:'600', minWidth:'160px', textAlign:'center', marginBottom:'12px', padding:'18px 12px'}}>
                <FaUsers style={{color:'#8c4be7',fontSize:'1.5rem',marginRight:'8px'}} />
                <span style={{fontSize:'1.1rem', fontWeight:'700'}}>TEAM</span><br />
                <span>$0</span><br />
                <button className="view-status-btn" style={{background:'#8c4be7',color:'#fff',marginTop:'8px',borderRadius:'8px',padding:'8px 18px',fontWeight:'600',fontSize:'1rem'}} onClick={e => {e.stopPropagation();navigate('/team')}}>View Status</button>
              </div>
            </div>
          </div>
            <div className="grid-right">
            <div className="wallet-box">
              <div className="wallet-title">Your wallet</div>
              <div className="wallet-desc">here you will check wallet transactions.</div>
              <div className="wallet-cards">
              <div className="wallet-card" onClick={() => navigate('/transactions')} style={{cursor:'pointer'}}>
                <FaWallet className="wallet-icon" />
                Available Funds<br />
                ${availableFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="wallet-card" onClick={() => navigate('/referral-income')} style={{cursor:'pointer'}}>
                <FaWallet className="wallet-icon" />
                Referral Income<br />
                ${referralIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="wallet-card" onClick={() => navigate('/referral-on-trading')} style={{cursor:'pointer'}}>
                <FaWallet className="wallet-icon" />
                Referral on Trading Income<br />$0
              </div>
              </div>
              <div className="wallet-btn-row">
                <button className="wallet-btn" style={{background:'#8c4be7'}} onClick={() => navigate('/deposit')}>Deposit</button>
                <button className="wallet-btn" style={{background:'#8c4be7'}} onClick={() => navigate('/withdrawal')}>Withdraw</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          2025 - 2026 © Client dashboard by <span style={{ color: '#8c4be7', fontWeight: 'bold' }}>Star Traders</span>
        </div>
      </div>
    </UniversalResponsiveLayout>
  );
}

export default Dashboard;