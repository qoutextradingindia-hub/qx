import React from 'react';
import './LoginPage.css';
import logo from './assets/logo.png';

const LoginPage = () => {
  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-header stylish-header">
          <img src={logo} alt="Star Traders Logo" className="login-logo" />
          <span className="login-brand stylish-brand">STAR TRADERS</span>
        </div>
        <h2 className="login-title">SIGN UP</h2>
        <form className="login-form">
          <input type="text" placeholder="Enter Sponsor ID" className="login-input" />
          <input type="text" placeholder="Enter Your Name" className="login-input" />
          <input type="email" placeholder="Enter Your Email Address" className="login-input" />
          <input type="password" placeholder="Enter Password" className="login-input" />
          <input type="password" placeholder="Enter Confirm Password" className="login-input" />
          <div className="login-remember">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              <a href="#" className="login-link">TERMS & CONDITIONS</a>
            </label>
          </div>
          <button type="submit" className="login-btn">Sign Up</button>
        </form>
        <div className="login-signup">
          already have account? <a href="#" className="signup-link">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
