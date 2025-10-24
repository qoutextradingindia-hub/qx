
import React from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';

const ProtectedAdminLayout = () => {
  const isAdminLoggedIn = localStorage.getItem('admin-auth') === 'true';
  const location = useLocation();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#e0f2fd', color: 'white' }}>
      <aside style={{ width: '240px', backgroundColor: '#1a1a2e', padding: '20px' }}>
        <h2 style={{ color: '#FF0700' }}>★ Star Traders</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/admin/dashboard" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Dashboard</Link></li>
          
          {/* 🎯 Binary Trading - Golden Highlighted */}
          <li style={{ marginBottom: '8px' }}>
            <Link to="/admin/symbols" style={{ 
              color: '#1a1a2e', 
              backgroundColor: '#FFD700', 
              fontWeight: 'bold',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'block',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }}>
              📊 Binary Trading
            </Link>
          </li>
          
          <li><Link to="/admin/users" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Users</Link></li>
          <li><Link to="/admin/deposits" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Deposits</Link></li>
          <li><Link to="/admin/withdrawals" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Withdrawals</Link></li>
          <li><Link to="/admin/reward-income" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Reward Income</Link></li>
          <li><Link to="/admin/boosting" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Boosting</Link></li>
          <li><Link to="/admin/offline-gateway" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Offline Gateway</Link></li>
          <li><Link to="/admin/settings" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Settings</Link></li>
          <li><Link to="/admin/analytics" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Analytics</Link></li>
          <li><Link to="/admin/transactions" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}> Transactions</Link></li>
          <li><Link to="/admin/trading-income" style={{ color: 'white', display: 'block', padding: '8px 0', textDecoration: 'none' }}>Trading Income</Link></li>
        </ul>
      </aside>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedAdminLayout;