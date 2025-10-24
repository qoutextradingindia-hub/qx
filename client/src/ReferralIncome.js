
import React, { useEffect, useState } from 'react';
import './ReferralIncome.css';
import axios from 'axios';

const ReferralIncome = () => {
  const [referralData, setReferralData] = useState([]);
  const [totalReferralIncome, setTotalReferralIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    // Fetch referral income data
    axios
      .get(`https://qxtrand.onrender.com/api/user/referral-income/${user._id}`)
      .then((res) => {
        if (res.data.success) {
          setReferralData(res.data.transactions || []);
          setTotalReferralIncome(parseFloat(res.data.totalReferralIncome) || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching referral income", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: 'white', background: 'transparent', minHeight: '100vh', textAlign: 'center' }}>
        <h2>Loading Referral Income...</h2>
      </div>
    );
  }

  // Group by level
  const levelStats = {};
  referralData.forEach(transaction => {
    const level = transaction.level || 1;
    if (!levelStats[level]) {
      levelStats[level] = { count: 0, amount: 0 };
    }
    levelStats[level].count++;
    levelStats[level].amount += transaction.amount || 0;
  });

  return (
    <div style={{ padding: '20px', color: 'white', background: 'transparent', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Referral Income</h2>

      {/* Total Summary */}
      <div style={{ 
        background: '#1a1a3a', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#FFD700', marginBottom: '10px' }}>
          Total Referral Earnings: ${totalReferralIncome.toFixed(2)}
        </h3>
        <p style={{ color: '#ccc' }}>
          Total Transactions: {referralData.length}
        </p>
      </div>

      {/* Level Breakdown */}
      {Object.keys(levelStats).length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Level Income Breakdown</h3>
          {Object.entries(levelStats).map(([level, stats]) => (
            <div key={level} style={{
              background: '#2a2a4a',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Level {level}</span>
              <span style={{ color: '#4CAF50' }}>
                {stats.count} transactions - ${stats.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h3 style={{ marginBottom: '20px' }}>Recent Referral Income</h3>
        {referralData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No referral income yet</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {referralData.slice(0, 20).map((transaction, index) => (
              <div key={index} style={{
                background: '#2a2a4a',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#FFD700' }}>+${transaction.amount?.toFixed(2)}</span>
                  <span style={{ color: '#888', fontSize: '12px' }}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#ccc' }}>
                  {transaction.description} - Level {transaction.level || 1}
                </div>
                {transaction.fromUser && (
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    From: {transaction.fromUser.name || transaction.fromUser.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralIncome;
