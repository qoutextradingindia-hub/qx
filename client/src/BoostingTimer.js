import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';

const BoostingTimer = ({ userId }) => {
  const [boosting, setBoosting] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [message, setMessage] = useState('');
  const [directReferrals, setDirectReferrals] = useState(0);

  useEffect(() => {
    if (!userId) return;
    checkBoostingStatus();
    const checkInterval = setInterval(checkBoostingStatus, 30000); // Check every 30 seconds
    return () => clearInterval(checkInterval);
  }, [userId]);

  useEffect(() => {
    if (!boosting) return;
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => updateRemaining(boosting), 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [boosting]);

  const checkBoostingStatus = async () => {
    try {
      const response = await axios.get(`https://qx-yb3z.onrender.com/api/user/check-boosting/${userId}`);
      if (response.data.success) {
        setBoosting(response.data.boosting);
        setDirectReferrals(response.data.directReferrals || 0);
        if (response.data.message) {
          setMessage(response.data.message);
          // Clear message after 10 seconds
          setTimeout(() => setMessage(''), 10000);
        }
        updateRemaining(response.data.boosting);
      }
    } catch (err) {
      console.error('Check boosting error:', err);
    }
  };

  const updateRemaining = (boosting) => {
    if (!boosting || !boosting.isActive) return setRemaining(0);
    const end = new Date(boosting.endTime);
    const now = new Date();
    const diff = Math.max(0, end - now);
    setRemaining(diff);
  };

  // Show success message if achieved 3x
  if (message && message.includes('Congratulations')) {
    return (
      <Alert 
        severity="success" 
        icon={<EmojiEventsIcon />}
        sx={{ 
          mb: 2, 
          background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
          color: 'white',
          '& .MuiAlert-icon': { color: 'white' }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {message}
        </Typography>
      </Alert>
    );
  }

  // Show failure message if time expired
  if (message && message.includes('expired')) {
    return (
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
      >
        <Typography variant="body1">
          {message}
        </Typography>
      </Alert>
    );
  }

  if (!boosting || !boosting.isActive) return null;

  // Format remaining as HH:MM:SS
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  // 72 hours = 72 * 60 * 60 * 1000 ms
  const percent = 100 - (remaining / (72 * 60 * 60 * 1000)) * 100;

  return (
    <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: '#222', color: '#fff', boxShadow: 2 }}>
      {/* Timer Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1, color: '#FFD700' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Boosting Active: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </Typography>
        </Box>
      </Box>
      
      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={percent} 
        sx={{ 
          width: '100%', 
          height: 8, 
          borderRadius: 4, 
          background: '#444', 
          '& .MuiLinearProgress-bar': { 
            background: boosting.achieved3x ? '#4CAF50' : '#FFD700' 
          } 
        }} 
      />
      
      {/* Status Information */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: boosting.achieved3x ? '#4CAF50' : '#FFD700' }}>
          {boosting.achieved3x ? '✅ 3X Return Active (300 days)' : '⏳ Standard Boosting (72 hours)'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon sx={{ color: '#888', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#888' }}>
            Referrals: {directReferrals}/2
          </Typography>
        </Box>
      </Box>
      
      {/* Challenge Information */}
      {!boosting.achieved3x && (
        <Box sx={{ mt: 1, p: 1, background: '#333', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#FFA500', textAlign: 'center' }}>
            💡 Get 2 direct referrals with equal/higher deposit within <b>72 hours</b> to unlock 3X plan (300 days)!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BoostingTimer;
