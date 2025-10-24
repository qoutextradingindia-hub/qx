import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const ForgotPassword = () => {
  const [timer, setTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const otpInputRef = React.useRef();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP (Forgot Password)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://qx-yb3z.onrender.com/api/user/send-forgot-otp', { email });
      setMsg(res.data.message || 'OTP sent to your email');
      setStep(2);
      setTimer(60); // 1 minute timer
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error sending OTP');
    }
    setLoading(false);
  };

  // Timer effect for resend OTP
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Resend OTP handler (Forgot Password)
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const res = await axios.post('https://qx-yb3z.onrender.com/api/user/send-forgot-otp', { email });
      setMsg(res.data.message || 'OTP resent to your email');
      setTimer(60);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error resending OTP');
    }
    setResendLoading(false);
  };

  // Step 2: Verify OTP, then allow password reset
  const [otpVerified, setOtpVerified] = useState(false);
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setMsg('Please enter the OTP sent to your email.');
      otpInputRef.current && otpInputRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('https://qx-yb3z.onrender.com/api/user/verify-forgot-otp', { email, otp });
      if (res.data.message === 'OTP Verified') {
        setOtpVerified(true);
        setMsg('OTP Verified. Please enter new password.');
      } else {
        setMsg(res.data.message || 'Invalid OTP');
        setOtp('');
        otpInputRef.current && otpInputRef.current.focus();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error verifying OTP');
      setOtp('');
      otpInputRef.current && otpInputRef.current.focus();
    }
    setLoading(false);
  };

  // Step 3: Reset Password (after OTP verified)
  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMsg('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post('/api/user/reset-password', { email, otp, password });
      setMsg(res.data.message || 'Password reset successful');
      setOtp('');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error resetting password');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="user-details-container" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h2 className="user-details-heading">Forgot Password</h2>
        {msg && <div style={{ color: msg.includes('successful') ? '#00ff88' : '#ff0055', marginBottom: 12 }}>{msg}</div>}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input type="email" required placeholder="Registered Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6 }} />
            <button type="submit" className="transfer-btn" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}
        {step === 2 && !otpVerified && (
          <>
            <form onSubmit={handleVerifyOtp} autoComplete="off">
              <input
                type="text"
                required
                placeholder="Enter OTP"
                value={otp}
                ref={otpInputRef}
                onChange={e => {
                  setOtp(e.target.value.replace(/[^0-9]/g, ''));
                  setMsg('');
                }}
                maxLength={6}
                style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, letterSpacing: '2px', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', background: '#f7f8fa' }}
                inputMode="numeric"
                autoFocus
              />
              <div style={{color:'#888',fontSize:'0.95rem',marginBottom:8}}>Check your email for the OTP. (Check spam folder too)</div>
              <button type="submit" className="transfer-btn" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            </form>
            <div style={{ marginTop: 10, color: '#00bcd4', fontWeight: 500, textAlign:'center' }}>
              {timer > 0 ? `Resend OTP in ${timer}s` : ''}
            </div>
            <button
              type="button"
              className="transfer-btn"
              style={{ marginTop: 10, background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', width: '100%' }}
              onClick={handleResendOtp}
              disabled={timer > 0 || resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Send Again'}
            </button>
          </>
        )}
        {step === 2 && otpVerified && (
          <form onSubmit={handleReset} autoComplete="off">
            <input type="password" required placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6 }} />
            <input type="password" required placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6 }} />
            <button type="submit" className="transfer-btn" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </>
  );
}

export default ForgotPassword;
