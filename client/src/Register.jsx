// Minor update for deployment trigger

import React, { useState } from 'react';
import axios from 'axios';
import './register.css';
// import logo from './assets/logo.png';

function Register() {
  const [sponsorId, setSponsorId] = useState('');

  // Referral link se sponsorId auto-fill (always uppercase)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setSponsorId(ref.toUpperCase());
    }
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert('Please accept Terms & Conditions');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const url = 'https://startradersindia.in/api/register';
      const res = await axios.post(url, {
        sponsorId: sponsorId ? sponsorId.toUpperCase() : '',
        name,
        email,
        password,
      });
      console.log('Sponsor ID being sent:', sponsorId);
      alert(res.data.message || 'Registered successfully');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={require('./assets/logo.png')} alt="Star Traders Logo" className="register-logo" />
        <div className="register-title">STAR TRADERS</div>
        <div style={{ color: '#8c52ff', fontWeight: 600, marginBottom: 18, textAlign: 'center', letterSpacing: '1px' }}>SIGN UP</div>
        <form style={{ width: '100%' }} onSubmit={handleSubmit}>
          <input
            className="register-input"
            type="text"
            placeholder="Enter Sponsor ID"
            value={sponsorId}
            onChange={(e) => setSponsorId(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="email"
            placeholder="Enter Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="password"
            placeholder="Enter Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="register-checkbox">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              id="acceptTerms"
              required
            />
            <label htmlFor="acceptTerms">
              Accept <a href="#" style={{ color: '#6c4ccf', fontWeight: 600 }}>TERMS & CONDITIONS</a>
            </label>
          </div>
          <button className="register-btn" type="submit">Sign Up</button>
        </form>
        <div className="register-login">
          already have account?
          <a href="/login"> Login here</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
