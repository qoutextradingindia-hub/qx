import React, { useEffect, useState } from 'react';
import './Team.css';
import { FaUsers } from 'react-icons/fa';
// import logo from './assets/logo.png';
import { Box } from '@mui/material';
import axios from 'axios';
import ReferralList from './ReferralList';

const Team = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [overview, setOverview] = useState(null);
  const [liveJoin, setLiveJoin] = useState(null);

  const fetchOverview = () => {
    if (!user?._id) return;
    axios.get(`https://startradersindia.in/api/user/referral-overview/${user._id}`)
      .then(res => {
        setOverview(res.data);
      });
  };

  useEffect(() => {
    fetchOverview();
    // Poll for new join every 10s
    const interval = setInterval(() => {
      axios.get(`https://startradersindia.in/api/user/referral-overview/${user._id}`).then(res => {
        if (overview && res.data.referralList && res.data.referralList.length > overview.referralList.length) {
          // New join detected
          const newRef = res.data.referralList.find(r => !overview.referralList.some(o => o._id === r._id));
          if (newRef) setLiveJoin(newRef);
        }
        setOverview(res.data);
      });
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user]);

  const levelSummary = overview?.levelSummary || [{}, {}, {}];
  const activeMembers = overview?.referralList?.filter(r => r.active).length || 0;
  const totalTeam = overview?.totalReferrals || 0;
  const directReferrals = levelSummary[0]?.users || 0;
  const referralIncome = overview?.totalReferralIncome || 0;
  const rewardIncome = overview?.rewardIncome || 0;

  return (
    <div style={{ background: '#f6f6fa', minHeight: '100vh', padding: 0, margin: 0 }}>
      <div style={{ background: '#a259e6', padding: '18px 0 10px 0', borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {/* Logo removed as requested */}
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 30, letterSpacing: 1, marginRight: 16 }}>STAR TRADERS</span>
      </div>
      <div style={{ maxWidth: 420, margin: '24px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e0e0', padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 8, textAlign: 'center' }}>Team</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ border: '2px dashed #a259e6', borderRadius: 10, padding: '16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, color: '#a259e6', fontSize: 16 }}>
            <span>TEAM</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontWeight: 700, fontSize: 20 }}>{totalTeam}</span> <FaUsers /></span>
          </div>
          <div style={{ border: '2px dashed #a259e6', borderRadius: 10, padding: '16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, color: '#a259e6', fontSize: 16 }}>
            <span>ACTIVE MEMBERS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontWeight: 700, fontSize: 20 }}>{activeMembers}</span> <FaUsers /></span>
          </div>
          <div style={{ border: '2px dashed #a259e6', borderRadius: 10, padding: '16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, color: '#a259e6', fontSize: 16 }}>
            <span>DIRECT REFERRALS</span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{directReferrals}</span>
              <FaUsers />
            </span>
          </div>
        </div>
        {/* Active Members with transaction history and direct referrals details as per new design */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 8, textAlign: 'center' }}>Active Members Details</div>
          {overview?.referralList && overview.referralList.length > 0 ? (
            <div style={{ marginBottom: 24 }}>
              <ReferralList data={overview.referralList.filter(r => r.active)} type="referral" />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#a259e6', marginBottom: 24 }}>
              No Active Member found
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 8, textAlign: 'center' }}>Direct Referrals Details</div>
          {overview?.referralList && overview.referralList.length > 0 ? (
            <div>
              <ReferralList data={overview.referralList.filter(r => r.level === 1)} type="referral" />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#a259e6' }}>
              No Direct Referral found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;