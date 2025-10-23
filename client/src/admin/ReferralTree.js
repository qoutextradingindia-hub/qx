import React, { useState } from 'react';
import axios from 'axios';
import { Card, Typography, Button, TextField, Grid, Paper } from '@mui/material';

const ReferralTreeAdmin = () => {
  const [userId, setUserId] = useState('');
  const [tree, setTree] = useState(null);
  const [error, setError] = useState('');

  const fetchTree = () => {
    setError('');
    axios.get(`/api/admin/referral-tree/${userId}`)
      .then(res => {
        if (res.data.success) setTree(res.data);
        else setError('Not found');
      })
      .catch(() => setError('Not found'));
  };

  return (
    <Paper elevation={3} style={{ padding: 24, maxWidth: 900, margin: '32px auto', background: '#181c2f', color: '#fff' }}>
      <Typography variant="h5" gutterBottom>Referral Tree (3 Levels)</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item><TextField label="User ID" value={userId} onChange={e => setUserId(e.target.value)} size="small" /></Grid>
        <Grid item><Button variant="contained" onClick={fetchTree}>Fetch</Button></Grid>
      </Grid>
      {error && <Typography color="error">{error}</Typography>}
      {tree && (
        <div style={{ marginTop: 24 }}>
          <Card style={{ marginBottom: 16, padding: 16, background: '#23234a' }}>
            <Typography variant="h6">Root User</Typography>
            <Typography>Name: {tree.user.name} | Email: {tree.user.email} | Deposit: ${tree.user.depositedAmount} | Wallet: ${tree.user.wallet}</Typography>
          </Card>
          {[1,2,3].map(level => (
            <div key={level} style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1">Level {level} ({tree[`level${level}`].length} users)</Typography>
              <Grid container spacing={1}>
                {tree[`level${level}`].map(u => (
                  <Grid item xs={12} sm={6} md={4} key={u._id}>
                    <Card style={{ padding: 12, background: '#23234a', marginBottom: 8 }}>
                      <Typography>Name: {u.name}</Typography>
                      <Typography>Email: {u.email}</Typography>
                      <Typography>Deposit: ${u.depositedAmount}</Typography>
                      <Typography>Wallet: ${u.wallet}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
};

export default ReferralTreeAdmin;
