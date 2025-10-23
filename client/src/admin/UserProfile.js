
import React from 'react';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();

  // Dummy user data – you can replace this with real API call
  const user = {
    name: "User " + id,
    email: `user${id}@domain.com`,
    balance: "$1000",
    status: "Active",
  };

  return (
    <div style={{ padding: '30px', color: 'white' }}>
      <h2>User Profile: {user.name}</h2>
      <p><strong>User ID:</strong> {id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Balance:</strong> {user.balance}</p>
      <p><strong>Status:</strong> {user.status}</p>

      <div style={{ marginTop: '20px' }}>
        <button style={btn}>Credit</button>
        <button style={btn}>Debit</button>
        <button style={btn}>Ban User</button>
        <button style={btn}>Toggle Login Access</button>
      </div>
    </div>
  );
};

const btn = {
  margin: '10px',
  padding: '10px 20px',
  backgroundColor: '#ffb400',
  border: 'none',
  color: 'black',
  borderRadius: '8px',
  cursor: 'pointer'
};

export default UserProfile;