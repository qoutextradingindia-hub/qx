import React, { useState } from 'react';
import './Dashboard.css';
import axios from 'axios';

export default function USDTWithdrawalPage() {
  // Load wallet address from localStorage if available
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('savedWalletAddress') || '');
  const [addressSaved, setAddressSaved] = useState(!!localStorage.getItem('savedWalletAddress'));
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  // Timer effect for resend OTP
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Send OTP for withdrawal
  const handleSendOtp = async () => {
    setOtpMsg('');
    setOtpLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.post('https://startradersindia.in/api/user/send-withdraw-otp', {
        email: user.email
      });
      setOtpMsg(res.data.message || 'OTP sent to your email');
      setOtpSent(true);
      setTimer(60);
    } catch (err) {
      setOtpMsg(err.response?.data?.message || 'Error sending OTP');
    }
    setOtpLoading(false);
  };

  // First verify OTP, then allow withdrawal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (walletAddress.trim() === '' || parseFloat(amount) < 10) {
      setError('Please enter a valid wallet address and minimum $10 amount.');
      return;
    }
    if (!otp) {
      setError('Please enter the OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // 1. Verify OTP first
      const verifyRes = await axios.post('https://startradersindia.in/api/user/verify-withdraw-otp', {
        email: user.email,
        otp
      });
      if (verifyRes.data.message !== 'OTP Verified') {
        setError(verifyRes.data.message || 'Invalid OTP');
        setLoading(false);
        return;
      }
      // 2. Proceed with withdrawal
      const res = await axios.post('https://startradersindia.in/api/user/withdrawal', {
        userId: user._id,
        amount: parseFloat(amount),
        wallet: walletAddress,
        otp
      });
      if (res.data.success) {
        setSubmitted(true);
        setAmount('');
        setWalletAddress('');
        setOtp('');
        setOtpSent(false);
      } else {
        setError(res.data.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{minHeight:'100vh',background:'#f7f8fa',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'18px',boxShadow:'0 4px 32px rgba(140,82,255,0.10)',padding:'32px 24px',maxWidth:'400px',width:'100%',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <h2 style={{color:'#8c52ff',fontWeight:700,fontSize:'2rem',marginBottom:'18px',letterSpacing:'1px',textAlign:'center'}}>Withdrawal</h2>
        <form onSubmit={handleSubmit} style={{width:'100%'}}>
          <input
            type="text"
            placeholder="Enter Wallet Address"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1.5px solid #8c52ff',marginBottom:'12px',fontSize:'1rem',background:'#f7f8fa',color:'#222'}}
            disabled={addressSaved}
          />
          {!addressSaved ? (
            <button
              type="button"
              style={{width:'100%',background:'#8c52ff',color:'#fff',fontWeight:'600',fontSize:'1rem',border:'none',borderRadius:'8px',padding:'10px 0',marginBottom:'10px',cursor:'pointer'}}
              onClick={() => {
                if (walletAddress.trim() === '') {
                  setError('Please enter a wallet address to save.');
                  return;
                }
                localStorage.setItem('savedWalletAddress', walletAddress);
                setAddressSaved(true);
                setError('');
              }}
            >Save Wallet Address</button>
          ) : (
            <button
              type="button"
              style={{width:'100%',background:'#ff9800',color:'#fff',fontWeight:'600',fontSize:'1rem',border:'none',borderRadius:'8px',padding:'10px 0',marginBottom:'10px',cursor:'pointer'}}
              onClick={() => {
                localStorage.removeItem('savedWalletAddress');
                setAddressSaved(false);
                setWalletAddress('');
              }}
            >Change Wallet Address</button>
          )}
          <input
            type="number"
            placeholder="Enter Amount (Minimum $10)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1.5px solid #8c52ff',marginBottom:'12px',fontSize:'1rem',background:'#f7f8fa',color:'#222'}}
          />
          {/* OTP Section */}
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px',gap:'8px'}}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              style={{flex:1,padding:'12px',borderRadius:'8px',border:'1.5px solid #8c52ff',fontSize:'1rem',background:'#f7f8fa',color:'#222'}}
              disabled={!otpSent}
            />
            <button
              type="button"
              style={{background:'#00bcd4',color:'#fff',fontWeight:'600',fontSize:'1rem',border:'none',borderRadius:'8px',padding:'10px 16px',cursor:'pointer',minWidth:'110px'}}
              onClick={handleSendOtp}
              disabled={otpLoading || timer > 0}
            >
              {otpLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Send OTP'}
            </button>
          </div>
          {otpMsg && <div style={{color:'#00bcd4',marginBottom:'8px',fontWeight:'600'}}>{otpMsg}</div>}
          <ul style={{color:'#8c52ff',fontSize:'0.98rem',marginBottom:'12px',textAlign:'left',fontWeight:'500'}}>
            <li>Minimum Withdrawal: $10</li>
            <li>Admin Charges: 5%</li>
            <li>Only USDT BEP-20 withdrawals are supported</li>
          </ul>
          {error && <div style={{color:'#d32f2f',marginBottom:'8px',fontWeight:'600'}}>{error}</div>}
          <button
            type="submit"
            style={{width:'100%',background:'#8c52ff',color:'#fff',fontWeight:'600',fontSize:'1.1rem',border:'none',borderRadius:'8px',padding:'12px 0',marginBottom:'8px',cursor:'pointer'}}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          {submitted && <div style={{color:'#4caf50',marginTop:'8px',fontWeight:'600'}}>Withdrawal request submitted successfully!</div>}
        </form>
        <div style={{color:'#888',fontSize:'0.95rem',marginTop:'14px',textAlign:'center'}}>Ensure wallet address is correct. Transaction once processed cannot be reversed.</div>
      </div>
    </div>
  );
}

