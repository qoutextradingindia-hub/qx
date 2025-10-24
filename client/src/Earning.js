
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaChartLine, FaUsers, FaStar, FaGift, FaShieldAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';


function Earning() {
  const [incomes, setIncomes] = useState({
    trading_income: 0,
    referral_income: 0,
    referral_on_trading: 0,
    reward_income: 0,
    salary_income: 0,
    total: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;
    axios.get(`https://qxtrand.onrender.com/api/user/transactions/${user._id}`)
      .then(function(res) {
        if (res.data.success && Array.isArray(res.data.history)) {
          let sums = {
            trading_income: 0,
            referral_income: 0,
            referral_on_trading: 0,
            reward_income: 0,
            salary_income: 0,
            total: 0
          };
          for (let txn of res.data.history) {
            if (txn.type === 'trading_income') sums.trading_income += txn.amount || 0;
            if (txn.type === 'referral_income') sums.referral_income += txn.amount || 0;
            if (txn.type === 'referral_on_trading') sums.referral_on_trading += txn.amount || 0;
            if (txn.type === 'reward_income') sums.reward_income += txn.amount || 0;
            if (txn.type === 'salary_income') sums.salary_income += txn.amount || 0;
            sums.total += txn.amount || 0;
          }
          setIncomes(sums);
        }
      })
      .catch(function(err){
        // Optionally log error for debugging
      });
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Earning</h2>
      <div className="dashboard-box">
        <FaChartLine style={{ color: '#FFD700' }} />
        Trading income <span>{incomes.trading_income.toFixed(2)}</span>
      </div>
      <div className="dashboard-box">
        <FaUsers style={{ color: '#FFD700' }} />
        Referral income <span>{incomes.referral_income.toFixed(2)}</span>
      </div>
      <div className="dashboard-box">
        <FaStar style={{ color: '#FFD700' }} />
        Referral income on trading income <span>{incomes.referral_on_trading.toFixed(2)}</span>
      </div>
      <div className="dashboard-box">
        <FaGift style={{ color: '#FFD700' }} />
        Reward income <span>{incomes.reward_income.toFixed(2)}</span>
      </div>
      <div className="dashboard-box">
        <FaShieldAlt style={{ color: '#FFD700' }} />
        Salary income on direct business <span>{incomes.salary_income.toFixed(2)}</span>
      </div>
      <div className="dashboard-box">
        <FaMoneyBillWave style={{ color: '#FFD700' }} />
        Total earnings <span>{incomes.total.toFixed(2)}</span>
      </div>
    </div>
  );
}


export default Earning;