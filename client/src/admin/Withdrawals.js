import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Withdrawals.css';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://qxtrand.onrender.com/api/admin/withdrawals');
      if (res.data.success) setWithdrawals(res.data.withdrawals);
      else setError('Failed to fetch withdrawals');
    } catch (err) {
      setError('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'approve') {
        await axios.post('https://qxtrand.onrender.com/api/admin/approve-withdrawal', { id });
      } else {
        const adminNote = prompt('Enter rejection note (optional):') || '';
        await axios.post('https://qxtrand.onrender.com/api/admin/reject-withdrawal', { id, adminNote });
      }
      fetchWithdrawals();
    } catch (err) {
      alert('Action failed');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 24 }}>Withdrawals</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="withdrawal-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Wallet</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr><td colSpan="7">No withdrawal requests found</td></tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w._id}>
                    <td>{w.userId?.name || '-'}</td>
                    <td>{w.userId?.email || '-'}</td>
                    <td>${w.amount}</td>
                    <td>{w.wallet}</td>
                    <td style={{ textTransform: 'capitalize', color: w.status === 'approved' ? 'limegreen' : w.status === 'rejected' ? 'red' : '#FFD700' }}>{w.status}</td>
                    <td>{new Date(w.createdAt).toLocaleString()}</td>
                    <td>
                      {w.status === 'pending' && (
                        <>
                          <button className="withdrawal-action approve" disabled={actionLoading} onClick={() => handleAction(w._id, 'approve')}>
                            {actionLoading === w._id + 'approve' ? 'Approving...' : 'Approve'}
                          </button>
                          <button className="withdrawal-action reject" disabled={actionLoading} onClick={() => handleAction(w._id, 'reject')}>
                            {actionLoading === w._id + 'reject' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {w.status === 'rejected' && w.adminNote && (
                        <div style={{ color: '#aaa', fontSize: 12 }}>Note: {w.adminNote}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}