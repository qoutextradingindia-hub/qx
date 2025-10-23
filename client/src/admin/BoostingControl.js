import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Typography, Switch, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const BoostingControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/admin/boosting-users').then(res => {
      if (res.data.success) setUsers(res.data.users);
      setLoading(false);
    });
  };

  const toggleBoosting = (userId, isActive) => {
    axios.post('/api/admin/boosting-toggle', { userId, isActive: !isActive }).then(fetchUsers);
  };

  return (
    <Paper elevation={3} style={{ padding: 24, maxWidth: 900, margin: '32px auto', background: '#181c2f', color: '#fff' }}>
      <Typography variant="h5" gutterBottom>Boosting Management</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ color: '#FFD700' }}>User</TableCell>
            <TableCell style={{ color: '#FFD700' }}>Email</TableCell>
            <TableCell style={{ color: '#FFD700' }}>Boosting</TableCell>
            <TableCell style={{ color: '#FFD700' }}>Start</TableCell>
            <TableCell style={{ color: '#FFD700' }}>End</TableCell>
            <TableCell style={{ color: '#FFD700' }}>3X</TableCell>
            <TableCell style={{ color: '#FFD700' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.boosting?.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell>{u.boosting?.startTime ? new Date(u.boosting.startTime).toLocaleString() : '-'}</TableCell>
              <TableCell>{u.boosting?.endTime ? new Date(u.boosting.endTime).toLocaleString() : '-'}</TableCell>
              <TableCell>{u.boosting?.achieved3x ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Switch checked={u.boosting?.isActive} onChange={() => toggleBoosting(u._id, u.boosting?.isActive)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="contained" color="primary" onClick={fetchUsers} style={{ marginTop: 16 }} disabled={loading}>Refresh</Button>
    </Paper>
  );
};

export default BoostingControl;
