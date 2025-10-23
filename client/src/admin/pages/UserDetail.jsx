
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');

  useEffect(() => {
    axios.get(`https://startradersindia.in/api/admin/user/${id}`)
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user", err);
      });
  }, [id]);

  const handleBalanceUpdate = () => {
    if (!amount || isNaN(amount)) return alert("Enter valid amount");
    axios.post(`https://startradersindia.in/api/admin/update-balance`, {
      userId: id,
      amount: parseFloat(amount),
      type: type,
    }).then(res => {
      if (res.data.success) {
        setUser(res.data.user);
        setShowPopup(false);
        setAmount('');
      } else {
        alert("Failed to update balance");
      }
    }).catch(err => {
      console.error(err);
      alert("Error occurred");
    });
  };

  if (!user) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div className="user-details-container">
      <h2 className="user-details-heading">USER DETAILS</h2>
      <div className="user-info">
        <p><strong>User Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Deposited Balance:</strong>
          <span className="amount clickable" onClick={() => setShowPopup(true)}>
            ${user.balance?.toFixed(2)}
          </span>
        </p>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Update Balance</h3>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="popup-actions">
              <button onClick={handleBalanceUpdate}>Submit</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="user-actions">
        <button className="transfer-btn">Transfer</button>
        <button className="ban-btn">Ban</button>
        <button className="transfer-btn">Login as User</button>
      </div>

      <h3 className="user-details-heading">TRANSACTION HISTORY</h3>
      <div className="user-info" style={{ background: 'transparent', padding: '10px', borderRadius: '5px' }}>
        <p>No transactions found.</p>
      </div>

      <div className="boosting-section">
        <h3 className="user-details-heading">BOOSTING</h3>
        <div className="boost-bar"></div>
        <p className="countdown">Boosting ends in: 20 hr 5 min</p>
      </div>
    </div>
  );
};

export default UserDetail;
