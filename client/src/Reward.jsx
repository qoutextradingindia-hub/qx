import React from 'react';
import './Dashboard.css';

const Reward = () => {
  const rewardData = [
    { directBusiness: '$10,000', reward: '$250' },
    { directBusiness: '$25,000', reward: '$500' },
    { directBusiness: '$100,000', reward: '$1,000' },
    { directBusiness: '$500,000', reward: '$2,000' },
    { directBusiness: '$2,000,000', reward: '$25,000' }
  ];

  const referralLevels = [
    { level: 'Level 1', percentage: '15%' },
    { level: 'Level 2', percentage: '12%' },
    { level: 'Level 3', percentage: '10%' },
    { level: 'Level 4', percentage: '8%' },
    { level: 'Level 5', percentage: '7%' },
    { level: 'Level 6', percentage: '6%' },
    { level: 'Level 7', percentage: '5%' },
    { level: 'Level 8', percentage: '4%' },
    { level: 'Level 9', percentage: '3%' },
    { level: 'Level 10', percentage: '2%' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="star-logo">
            <span className="star-icon">⭐</span>
            <h1 className="company-name">STAR TRADERS</h1>
          </div>
        </div>

        {/* Reward Income Section */}
        <div className="reward-income-section mb-8">
          <h2 className="section-title">REWARD INCOME</h2>
          
          {/* Reward Eligibility Condition */}
          <div className="reward-eligibility-card">
            <div className="eligibility-icon">🔒</div>
            <h3 className="eligibility-title">Reward Eligibility Condition:</h3>
            <p className="eligibility-text">
              To qualify for rewards, the business volume must be generated equally — 
              50% from one leg and 50% from all other legs combined
            </p>
          </div>
          
          <div className="reward-table">
            <div className="reward-header">
              <div className="header-item">Direct Business</div>
              <div className="header-item">Reward</div>
            </div>
            
            {rewardData.map((item, index) => (
              <div key={index} className="reward-row">
                <div className="reward-cell">{item.directBusiness}</div>
                <div className="reward-cell reward-amount">{item.reward}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Income on Trading Income Section */}
        <div className="referral-trading-section">
          <h2 className="section-title">Referral Income on Trading Income</h2>
          
          <div className="referral-table">
            <div className="referral-header">
              <div className="header-item">Level</div>
              <div className="header-item">Income %</div>
            </div>
            
            {referralLevels.map((item, index) => (
              <div key={index} className="referral-row">
                <div className="referral-cell">{item.level}</div>
                <div className="referral-cell referral-percentage">{item.percentage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reward;
