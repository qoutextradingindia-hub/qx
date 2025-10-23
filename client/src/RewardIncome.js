import React from 'react';
import './RewardIncome.css';

const RewardIncome = () => {
  const rewards = [
    { business: '$10,000', reward: '$250' },
    { business: '$25,000', reward: '$500' },
    { business: '$50,000', reward: '$1,000' },
    { business: '$100,000', reward: '$2,000' },
    { business: '$500,000', reward: '$10,000' },
    { business: '$2,000,000', reward: '$25,000' },
  ];

  return (
    <div className="reward-container">
      <h2 className="reward-title">REWARD INCOME</h2>
      <table className="reward-table">
        <thead>
          <tr>
            <th>Direct Business</th>
            <th>Reward</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map((item, index) => (
            <tr key={index}>
              <td>{item.business}</td>
              <td>{item.reward}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardIncome;