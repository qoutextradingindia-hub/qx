
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
          <li><Link to="/admin/dashboard"> Dashboard</Link></li>
          <li><Link to="/admin/users"> Users</Link></li>
          <li><Link to="/admin/deposits"> Deposits</Link></li>
          <li><Link to="/admin/withdrawals"> Withdrawals</Link></li>
          <li><Link to="/admin/reward-income"> Reward Income</Link></li>
          <li><Link to="/admin/boosting"> Boosting</Link></li>
          <li><Link to="/admin/offline-gateway"> Offline Gateway</Link></li>
          <li><Link to="/admin/settings"> Settings</Link></li>
          <li><Link to="/admin/analytics"> Analytics</Link></li>
          <li><Link to="/admin/transactions"> Transactions</Link></li>
          <li><Link to="/admin/trading-income">Trading Income</Link></li>
        </ul>
      </aside>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedAdminLayout;