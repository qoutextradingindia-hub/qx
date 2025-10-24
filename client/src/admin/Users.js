
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get('https://qx-yb3z.onrender.com/api/admin/users')
      .then((res) => {
        console.log('API Response:', res.data);
        if (res.data.success) {
          setUsers(res.data.users);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch users", err);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#ffffff', minHeight: '100vh', padding: '40px' }}>
      <h2 style={{ textAlign: 'center', color: '#58a6ff', marginBottom: '30px' }}>
        {/* Removed black box and heading as requested */}
      </h2>
      <div style={{ backgroundColor: '#161b22', padding: '20px', borderRadius: '10px' }}>
        <h3 style={{ color: '#c9d1d9', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
          Users
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#21262d', color: '#ffffff' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>User Name</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>User ID</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #30363d' }}>
                  <td style={{ padding: '12px' }}>
                    <Link
                      to={`/admin/user/${user._id}`}
                      style={{ color: '#58a6ff', textDecoration: 'none' }}
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td style={{ padding: '12px', color: '#c9d1d9' }}>{user._id}</td>
                  <td style={{ padding: '12px', color: '#c9d1d9' }}>{user.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#888' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
