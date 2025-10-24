import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logout from './Logout';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#e0f2fd', color: 'white' }}>
      <aside style={{ width: '240px', backgroundColor: '#1a1a2e', padding: '20px' }}>
        <h2 style={{ color: '#FF0700' }}>★ Star Traders</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/admin/trading-income" style={{ color: 'white' }}>Trading Income</Link></li>
          <li><Link to="/admin/dashboard" style={{ color: 'white' }}>Dashboard</Link></li>
          <li><Link to="/admin/symbols" style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#FFD700', color: '#1a1a2e', padding: '8px', borderRadius: '4px', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>📊 Binary Trading</Link></li>
          <li><Link to="/admin/users" style={{ color: 'white' }}>Users</Link></li>
          <li><Link to="/admin/deposits" style={{ color: 'white' }}>Deposits</Link></li>
          <li><Link to="/admin/withdrawals" style={{ color: 'white' }}>Withdrawals</Link></li>
          <li><Link to="/admin/reward-income" style={{ color: 'white' }}>Reward Income</Link></li>
          <li style={{ margin: '16px 0 0 0', fontWeight: 700, color: '#FFD700' }}>Referral</li>
          <li style={{ marginLeft: 12 }}><Link to="/admin/referral-settings" style={{ color: 'white' }}>Referral Settings</Link></li>
          <li style={{ marginLeft: 12 }}><Link to="/admin/boosting" style={{ color: 'white' }}>Boosting Management</Link></li>
          <li><Link to="/admin/offline-gateway" style={{ color: 'white' }}>Offline Gateway</Link></li>
          <li><Link to="/admin/settings" style={{ color: 'white' }}>Settings</Link></li>
          <li><Link to="/admin/analytics" style={{ color: 'white' }}>Analytics</Link></li>
          <li><Link to="/admin/transactions" style={{ color: 'white' }}>Transactions</Link></li>
          <li><Link to="/admin/support" style={{ color: 'white' }}>Support</Link></li>
          <li><Logout /></li>
        </ul>
      </aside>

      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
