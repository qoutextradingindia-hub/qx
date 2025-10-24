
import React, { useEffect, useState } from 'react';
import './ReferralOnTrading.css';

const ReferralOnTrading = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [levelIncome, setLevelIncome] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;
    setLoading(true);
    fetch(`https://qx-yb3z.onrender.com/api/user/referral-trading-income?userId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalIncome(data.totalIncome || 0);
          setLevelIncome(data.levelIncome || {});
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="referral-on-trading-container">
      <h2 className="section-title">Referral Income on Trading Income</h2>
      <div className="reward-table" style={{ marginBottom: '2rem', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="reward-header">
          <div className="header-item">Total Referral Trading Income</div>
          <div className="header-item reward-amount">${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="referral-trading-section">
        <h3 className="referral-title">Referral Trading Income History</h3>
        {loading ? (
          <div className="referral-no-data">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="referral-no-data">No referral trading income found.</div>
        ) : (
          <div className="referral-table-wrapper">
            <table className="referral-table">
              <thead className="referral-header">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Level</th>
                  <th>From User</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={txn._id || idx} className={idx % 2 === 0 ? 'startraders-row-even' : 'startraders-row-odd'}>
                    <td>{txn.createdAt ? txn.createdAt.slice(0, 10) : '-'}</td>
                    <td className="referral-percentage">${txn.amount?.toFixed(2) || '0.00'}</td>
                    <td>{txn.level || '-'}</td>
                    <td>{txn.fromUser?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralOnTrading;
