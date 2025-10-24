// API Helper functions for StarTraders
// This file provides centralized API calls to avoid hardcoded URLs

import API from './api';

// Base URL getter function
export const getAPIBaseURL = () => {
  return process.env.REACT_APP_API_BASE_URL || 'https://qx-yb3z.onrender.com/api';
};

// Auth APIs
export const authAPI = {
  login: (credentials) => API.post('/login', credentials),
  register: (userData) => API.post('/register', userData),
  logout: () => API.post('/logout'),
  forgotPassword: (email) => API.post('/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/reset-password', { token, password }),
};

// User APIs
export const userAPI = {
  getProfile: (userId) => API.get(`/user/profile/${userId}`),
  updateProfile: (userId, data) => API.put(`/user/profile/${userId}`, data),
  getReferralIncome: (userId) => API.get(`/user/referral-income/${userId}`),
  getTradingIncome: (userId) => API.get(`/user/trading-income/${userId}`),
  getTransactions: (userId) => API.get(`/user/transactions/${userId}`),
  getReferralOverview: (userId) => API.get(`/user/referral-overview/${userId}`),
  getReferralTradingIncome: (userId) => API.get(`/user/referral-trading-income?userId=${userId}`),
  checkBoosting: (userId) => API.get(`/user/check-boosting/${userId}`),
  deposit: (data) => API.post('/user/deposit', data),
  withdrawal: (data) => API.post('/user/withdrawal', data),
  getDepositSettings: () => API.get('/user/deposit-settings'),
};

// Admin APIs
export const adminAPI = {
  getUser: (userId) => API.get(`/admin/user/${userId}`),
  getDeposits: () => API.get('/admin/deposits'),
  approveDeposit: (id) => API.post('/admin/approve-deposit', { id }),
  rejectDeposit: (id) => API.post('/admin/reject-deposit', { id }),
  getWithdrawals: () => API.get('/admin/withdrawals'),
  approveWithdrawal: (id) => API.post('/admin/approve-withdrawal', { id }),
  rejectWithdrawal: (id) => API.post('/admin/reject-withdrawal', { id }),
  getAllUsers: () => API.get('/admin/users'),
  updateUser: (userId, data) => API.put(`/admin/user/${userId}`, data),
  deleteUser: (userId) => API.delete(`/admin/user/${userId}`),
};

// Export default API instance
export default API;
