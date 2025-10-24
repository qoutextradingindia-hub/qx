import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReferralList from './ReferralList';
import './Dashboard.css';

const Referral = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = () => {
    if (!user?._id) return;
    setLoading(true);
    const url = `https://qx-yb3z.onrender.com/api/user/referral-overview/${user._id}`;
    console.log('[Referral] Fetching:', url);
    axios.get(url, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        console.log('[Referral] API response:', res.data);
        setOverview(res.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error('[Referral] API error:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, [user]);

  const NoReferralUI = () => (
    <></>
  );

  if (!overview || typeof overview !== 'object') {
    return (
      <div className="referral-theme-container">
        {/* Referral link block for all users */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <p className="text-sm text-gray-600">Your Referral Link:</p>
          <div className="flex items-center justify-between mt-2">
            <input
              type="text"
              readOnly
              value={`https://qx-473d.onrender.com/register?ref=${user?._id}`}
              className="border px-3 py-2 w-full rounded text-sm text-gray-800"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://qx-473d.onrender.com/register?ref=${user?._id}`);
                alert("Referral link copied!");
              }}
              className="ml-2 bg-purple-600 text-white px-3 py-2 rounded text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-theme-container">
      {/* Referral link block for all users */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <p className="text-sm text-gray-600">Your Referral Link:</p>
        <div className="flex items-center justify-between mt-2">
          <input
            type="text"
            readOnly
            value={`https://qx-473d.onrender.com/register?ref=${user?._id}`}
            className="border px-3 py-2 w-full rounded text-sm text-gray-800"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://qx-473d.onrender.com/register?ref=${user?._id}`);
              alert("Referral link copied!");
            }}
            className="ml-2 bg-purple-600 text-white px-3 py-2 rounded text-sm"
          >
            Copy
          </button>
        </div>
      </div>
      {/* ...existing code... */}
      <div className="referral-title">Referral Income Dashboard</div>
      <div className="referral-summary-card">
        <div className="referral-summary-heading">Referral Summary</div>
        <button className="referral-refresh-btn" onClick={() => { setRefreshing(true); fetchOverview(); }} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <table className="referral-summary-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Members</th>
              <th>Investment</th>
              <th>Earned Income</th>
            </tr>
          </thead>
          <tbody>
            {[1,2,3].map(lvl => (
              <tr key={lvl}>
                <td>L{lvl}</td>
                <td>{overview?.levelSummary?.[lvl-1]?.users ?? 0}</td>
                <td>${overview?.levelSummary?.[lvl-1]?.investment?.toFixed(2) ?? '0.00'}</td>
                <td>${overview?.levelSummary?.[lvl-1]?.earnings?.toFixed(2) ?? '0.00'}</td>
              </tr>
            ))}
            <tr className="referral-summary-total">
              <td>Total</td>
              <td>{overview?.totalReferrals ?? 0}</td>
              <td>${[0,1,2].reduce((a,i) => a + (overview?.levelSummary?.[i]?.investment || 0), 0).toFixed(2)}</td>
              <td>${[0,1,2].reduce((a,i) => a + (overview?.levelSummary?.[i]?.earnings || 0), 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="referral-section">
        <div className="referral-section-title">Live Referral List</div>
        <div className="referral-list-card">
          {overview?.referralList && overview.referralList.length > 0 ? (
            <ReferralList data={overview.referralList} type="referral" />
          ) : (
            <div className="referral-no-data">No referrals found</div>
          )}
        </div>
      </div>
      <div className="referral-section">
        <div className="referral-section-title">Referral Income History</div>
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg p-4 responsive-wrapper">
          {overview?.incomeHistory && overview.incomeHistory.length > 0 ? (
            <ReferralList data={overview.incomeHistory} type="history" />
          ) : (
            <div className="referral-no-data">No referral income history found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referral;
