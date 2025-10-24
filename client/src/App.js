import React from 'react';  
import { Routes, Route, Link, useLocation } from 'react-router-dom';  

import USDTWithdrawalPage from './USDTWithdrawalPage';
import ForgotPassword from './ForgotPassword.jsx';
import USDTDepositpage from './USDTDepositpage';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import Trading from './Trading.js';
// import ReferralIncome from './ReferralIncome.js';
import ReferralOnTrading from './ReferralOnTrading.js';
import SalaryIncome from './SalaryIncome.js';
import Team from './Team';
import Layout from './Layout';
import Earning from './Earning';
import Staking from './Staking';
import Reward from './Reward';
import Report from './Report';
import Support from './Support.jsx';


// ✅ Admin pages
import ProtectedAdminLayout from './admin/ProtectedAdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserDetail from './admin/pages/UserDetail.jsx';
import Users from './admin/Users';
import Deposits from './admin/Deposits';
import Withdrawals from './admin/Withdrawals';
import RewardIncome from './admin/RewardIncome';

import Boosting from './admin/Boosting';
import BoostingControl from './admin/BoostingControl';
import OfflineGateway from './admin/OfflineGateway';
import Settings from './admin/Settings';
import Analytics from './admin/Analytics';
import Transactions from './admin/Transactions';
import AdminSupport from './admin/Support';
import AdminLogin from './admin/AdminLogin';
import TradingIncome from './admin/TradingIncome';
import ReferralSettingsAdmin from './admin/ReferralSettings';
import AdminSymbols from './admin/AdminSymbols';
import TradingInterface from './TradingInterface';
import TransactionHistory from './TransactionHistory.jsx';
// import logo from './assets/logo.png';
// Old sidebar and hamburger menu imports removed if present
import Referral from './Referral.jsx';

const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/team" element={<Team />} />
          <Route path="/earning" element={<Earning />} />
          <Route path="/salary-income" element={<SalaryIncome />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/binary-trading" element={<TradingInterface />} />
          <Route path="/withdrawal" element={<USDTWithdrawalPage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/support" element={<Support />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Route>

        <Route path="/admin" element={<ProtectedAdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="user/:id" element={<UserDetail />} />
          <Route path="deposits" element={<Deposits />} />
          <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="reward-income" element={<RewardIncome />} />
        <Route path="boosting" element={<BoostingControl />} />
          <Route path="offline-gateway" element={<OfflineGateway />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="trading-income" element={<TradingIncome />} /> {/* ✅ Added Route */}
          <Route path="symbols" element={<AdminSymbols />} /> {/* 🎯 Binary Trading Symbols */}
          <Route path="referral-settings" element={<ReferralSettingsAdmin />} /> {/* ReferralSettingsAdmin का Route */}
        </Route>

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/deposit" element={<USDTDepositpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/trading-income" element={<Trading />} />
        <Route path="/reward" element={<Reward />} />
        <Route path="/team" element={<Team />} />
        {/* Referral Dashboard: All referral routes point to Referral.jsx */}
        <Route path="/referral-income" element={<Referral />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/dashboard/referral" element={<Referral />} />
        {/* Referral on trading income */}
        <Route path="/referral-on-trading" element={<ReferralOnTrading />} />
        <Route path="/salary-income" element={<SalaryIncome />} />

        {/* Home and 404 */}
        <Route path="/" element={<Login />} />
        <Route path="*" element={<h1 style={{ color: 'white' }}>Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default App;
