
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;
    axios.get(`https://qxtrand.onrender.com/api/user/transactions/${user._id}`)
      .then(res => {
        // Try to get balance from API response
        let bal = 0;
        if (typeof res.data.balance === 'number') bal = res.data.balance;
        else if (typeof res.data.availableFunds === 'number') bal = res.data.availableFunds;
        else if (typeof res.data.totalBalance === 'number') bal = res.data.totalBalance;
        setBalance(bal);
        const txns = Array.isArray(res.data.history)
          ? res.data.history
          : (Array.isArray(res.data.transactions) ? res.data.transactions : []);
        setTransactions(txns);
      })
      .catch(error => {
        setBalance(0);
        setTransactions([]);
      });
  }, []);

  return (
    <div className="transaction-history-container">
      <h2 className="transaction-title">Available Funds</h2>
      <div style={{
        color: '#6a0dad',
        fontSize: '2.2rem',
        fontWeight: 'bold',
        marginBottom: '18px',
        background: '#e0d4f7',
        borderRadius: '12px',
        padding: '18px 0',
        boxShadow: '0 2px 8px #6a0dad22',
        textAlign: 'center',
        maxWidth: '420px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
      <h2 className="transaction-title" style={{marginTop:'10px'}}>Transaction History</h2>
      <div className="transaction-table-wrapper">
        <table className="transaction-table startraders-theme">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>From User</th>
              <th>To User</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6a0dad', padding: '24px' }}>No transactions found.</td>
              </tr>
            ) : (
              transactions.map((txn, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'startraders-row-even' : 'startraders-row-odd'}>
                  <td style={{ textTransform: 'capitalize' }}>{txn.type}</td>
                  <td>{txn.amount}</td>
                  <td>{txn.fromUser || '-'}</td>
                  <td>{txn.toUser || '-'}</td>
                  <td>{txn.description || 'N/A'}</td>
                  <td>{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : (txn.date ? new Date(txn.date).toLocaleString() : '')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
