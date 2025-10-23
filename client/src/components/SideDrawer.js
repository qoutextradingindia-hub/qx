import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SideDrawer.css';

const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Prevent body scroll when sidebar is open (mobile fix)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close sidebar
    onClose();
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop/Overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          onTouchEnd={onClose}
        ></div>
      )}
      
      {/* Sidebar - Exact Sample Style */}
      <div className={`neopips-sidebar ${isOpen ? 'sidebar-open' : ''}`}>        
        {/* Navigation Menu */}
        <nav className="neopips-nav">
          
          <Link to="/reward" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">🏆</div>
            <span className="nav-text">Reward</span>
          </Link>
          
          <Link to="/team" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">👥</div>
            <span className="nav-text">Team</span>
          </Link>
          
          <Link to="/earning" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">💰</div>
            <span className="nav-text">Earning</span>
          </Link>
          
          <Link to="/salary-income" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">💼</div>
            <span className="nav-text">Salary Income</span>
          </Link>

          <Link to="/trading" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">📈</div>
            <span className="nav-text">Trading</span>
          </Link>

          <Link to="/trading-income" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">📊</div>
            <span className="nav-text">Trading Income</span>
          </Link>

          <Link to="/referral-income" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">👥</div>
            <span className="nav-text">Direct Referral Income</span>
          </Link>

          <Link to="/referral-on-trading" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">🔄</div>
            <span className="nav-text">Trading Income on Direct Referral</span>
          </Link>

          <Link to="/reward" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">🏆</div>
            <span className="nav-text">Reward Income</span>
          </Link>
          
          <Link to="/withdrawal" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">💳</div>
            <span className="nav-text">Withdraw</span>
          </Link>
          
          <Link to="/deposit" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">💵</div>
            <span className="nav-text">Deposit</span>
          </Link>
          
          <Link to="/support" className="neopips-nav-item" onClick={onClose}>
            <div className="nav-icon">🎧</div>
            <span className="nav-text">Support</span>
          </Link>
          
          <button onClick={handleLogout} className="neopips-nav-item logout-btn">
            <div className="nav-icon">�</div>
            <span className="nav-text">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default SideDrawer;
