import React, { useEffect, useState } from 'react';
import './Trading.css';
import { FaChartLine } from 'react-icons/fa';
import axios from 'axios';

const Trading = () => {
  const [transactions, setTransactions] = useState([]);
  const [todayIncome, setTodayIncome] = useState(0);
  const [lifetimeIncome, setLifetimeIncome] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    axios
      .get(`https://qxtrand.onrender.com/api/user/trading-income/${user._id}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.transactions)) {
          // This API returns only trading_income transactions
          setTransactions(res.data.transactions);
          // Lifetime income
          const total = res.data.transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
          setLifetimeIncome(total);
          // Today's income
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          const todayTotal = res.data.transactions
            .filter(txn => txn.createdAt && txn.createdAt.slice(0, 10) === todayStr)
            .reduce((sum, txn) => sum + (txn.amount || 0), 0);
          setTodayIncome(todayTotal);
        }
      })
      .catch((err) => {
        console.error('Error fetching trading income history', err);
      });
  }, []);

  return (
    <div className="trading-container">
      <h2 className="page-title">Trading Income</h2>

      <div className="trading-box">
        <div className="trading-icon-label">
          <FaChartLine className="icon-gold" />
          <span>Trading income</span>
        </div>
        <div className="trading-amount">
          {todayIncome.toFixed(2)} <span className="currency">USD</span>
        </div>
      </div>

      <div className="statistics-section">
        <h3 className="section-title">Statistics</h3>
        <div className="statistics-row">
          <div className="stat-box">
            <div className="stat-label">Lifetime</div>
            <div className="stat-value">{lifetimeIncome.toFixed(2)} USD</div>
          </div>
          <div className="divider" />
          <div className="stat-box">
            <div className="stat-label">Daily</div>
            <div className="stat-value">{todayIncome.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      <div className="strategies-section">
        <h3 className="section-title">Today's Strategy</h3>
      </div>

      <div className="history-section">
        <h3 className="section-title" style={{ color: '#6a0dad' }}>TRADING INCOME HISTORY</h3>
        <div className="trading-table-wrapper responsive-wrapper" style={{overflowX:'auto', background:'#fff', borderRadius: '12px', boxShadow:'0 0 10px rgba(0,0,0,0.08)', padding:'16px', marginTop:'12px', width:'100%'}}>
          {transactions.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '2rem', fontSize: '16px' }}>No trading income found.</div>
          ) : (
            <table className="trading-income-table history-table" style={{minWidth:'600px', width:'100%', color:'#333', fontSize:'14px', borderCollapse:'collapse'}}>
              <thead className="bg-purple-600 text-white text-sm font-semibold" style={{background:'#6a0dad', color:'#fff'}}>
                <tr>
                  <th style={{padding:'12px 8px', fontWeight:'600', whiteSpace:'nowrap'}}>Date</th>
                  <th style={{padding:'12px 8px', fontWeight:'600', whiteSpace:'nowrap'}}>Amount (USD)</th>
                  <th style={{padding:'12px 8px', fontWeight:'600', whiteSpace:'nowrap'}}>Txn ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={txn._id || idx} style={{background: idx%2===0 ? '#f3eaff' : '#fff', transition:'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background='#e9d5ff'} onMouseOut={e => e.currentTarget.style.background=idx%2===0 ? '#f3eaff' : '#fff'}>
                    <td style={{padding:'10px 8px', whiteSpace:'nowrap'}}>{txn.createdAt ? txn.createdAt.slice(0, 10) : ''}</td>
                    <td style={{padding:'10px 8px', whiteSpace:'nowrap'}}>{txn.amount}</td>
                    <td style={{padding:'10px 8px', whiteSpace:'nowrap'}}>{txn._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trading;