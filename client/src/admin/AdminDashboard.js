// Admin Dashboard for Star Traders
import React from 'react';
import { FaUsers, FaMoneyBillWave, FaCrown, FaRocket, FaRegNewspaper, FaCog, FaChartBar, FaStar, FaWallet, FaHandHoldingUsd, FaComments, FaChartLine } from 'react-icons/fa';

const cardStyle = {
  background: '#1e1e2f',
  color: 'yellow',
  padding: '20px',
  borderRadius: '10px',
  margin: '10px',
  flex: '1',
  minWidth: '200px',
  textAlign: 'center',
};

const AdminDashboard = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
      <div style={cardStyle}><FaUsers size={30} /><h3>Total Users</h3><p>1,500</p></div>
      <div style={cardStyle}><FaMoneyBillWave size={30} /><h3>Total Deposit</h3><p>$5,200</p></div>
      <div style={cardStyle}><FaCrown size={30} /><h3>Total Withdrawal</h3><p>$2,100</p></div>
      <div style={cardStyle}><FaCrown size={30} /><h3>Total Royal Income</h3><p>$2,100</p></div>
      <div style={cardStyle}><FaChartLine size={30} /><h3>Total Trading Income</h3><p>$1,200</p></div>
      <div style={cardStyle}><FaUsers size={30} /><h3>New Users</h3></div>
      <div style={cardStyle}><FaRegNewspaper size={30} /><h3>News</h3></div>
      <div style={cardStyle}><FaWallet size={30} /><h3>Offline Gateway</h3></div>
      <div style={cardStyle}><FaCog size={30} /><h3>Settings</h3></div>
      <div style={cardStyle}><FaChartBar size={30} /><h3>Analytics</h3></div>
      <div style={cardStyle}><FaMoneyBillWave size={30} /><h3>Total Earnings</h3></div>
      <div style={cardStyle}><FaRocket size={30} /><h3>Boosting</h3></div>
      <div style={cardStyle}><FaStar size={30} /><h3>Reward Income</h3></div>
      <div style={cardStyle}>
        <FaUsers size={30} />
        <h3>Referral System</h3>
        <a href="/admin/referral-settings" style={{ color: '#fff', textDecoration: 'underline' }}>Manage</a>
      </div>
      <div style={cardStyle}><FaComments size={30} /><h3>Support</h3></div>
    </div>
  );
};

export default AdminDashboard;
