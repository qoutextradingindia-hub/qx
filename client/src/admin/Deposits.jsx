
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Deposits.css';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await axios.get('https://startradersindia.in/api/admin/deposits');
      if (Array.isArray(res.data)) {
        setDeposits(res.data);
      } else {
        setDeposits([]);
        console.error("Invalid response format", res.data);
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post('https://startradersindia.in/api/admin/approve-deposit', { id });
      fetchDeposits();
    } catch (err) {
      console.error('Error approving deposit:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post('https://startradersindia.in/api/admin/reject-deposit', { id });
      fetchDeposits();
    } catch (err) {
      console.error('Error rejecting deposit:', err);
    }
  };

  return (
    <div className="deposit-container">
      <h2>Deposit Requests</h2>
      <table className="deposit-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Transaction ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(deposits || []).map((dep) => (
            <tr key={dep._id}>
              <td>{dep.userId?.name || 'N/A'}</td>
              <td>{dep.userId?.email || 'N/A'}</td>
              <td>${dep.amount}</td>
              <td>{dep.transactionId}</td>
              <td>{dep.status}</td>
              <td>
                {dep.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(dep._id)}>Approve</button>
                    <button onClick={() => handleReject(dep._id)}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Deposits;
