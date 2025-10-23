import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, TextField, Button, Typography, Grid, Paper } from '@mui/material';
import BoostingControl from './BoostingControl';

const ReferralSettingsAdmin = () => {
  const [settings, setSettings] = useState({
    level1Percent: 5,
    level2Percent: 3,
    level3Percent: 2,
    boostingTime: 24,
    minDirectReferrals: 2,
    boostingStatus: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('/api/admin/referral-settings')
      .then(res => {
        if (res.data.success) setSettings(res.data.settings);
      });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setLoading(true);
    axios.post('/api/admin/referral-settings', settings)
      .then(res => {
        setMsg('Settings updated!');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <>
      <Paper elevation={3} style={{ padding: 24, maxWidth: 600, margin: '32px auto', background: '#181c2f', color: '#fff' }}>
        <Typography variant="h5" gutterBottom>Referral System Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField label="Level 1 %" name="level1Percent" value={settings.level1Percent} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Level 2 %" name="level2Percent" value={settings.level2Percent} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Level 3 %" name="level3Percent" value={settings.level3Percent} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Boosting Time (hrs)" name="boostingTime" value={settings.boostingTime} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Min Direct Referrals" name="minDirectReferrals" value={settings.minDirectReferrals} onChange={handleChange} fullWidth /></Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: 24 }} disabled={loading}>Save</Button>
        {msg && <Typography style={{ color: 'lightgreen', marginTop: 12 }}>{msg}</Typography>}
      </Paper>
      <div style={{ margin: '40px 0 0 0' }}>
        <Typography variant="h5" gutterBottom style={{ color: '#FFD700' }}>Boosting Management</Typography>
        <BoostingControl />
      </div>
    </>
  );
};

export default ReferralSettingsAdmin;
