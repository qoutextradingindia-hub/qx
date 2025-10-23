const express = require('express');
const bcrypt = require('bcryptjs');
const { sendOtpMail } = require('../utils/sendMail');
const Otp = require('../models/otp');
const User = require('../models/user');

const router = express.Router();

// Helper: Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Save OTP to DB
async function saveOtp(email, otp, purpose) {
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await Otp.create({ email, otpHash, purpose, expiresAt });
}

// ========== Withdrawal OTP ========== //
// Send OTP for withdrawal
router.post('/send-withdraw-otp', async (req, res) => {
  const requestId = Date.now();
  console.log(`🔄 [${requestId}] Withdrawal OTP Request:`, {
    body: req.body,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  try {
    const { email } = req.body;
    
    if (!email) {
      console.warn(`⚠️ [${requestId}] Missing email in request`);
      return res.status(400).json({ 
        message: 'Email required',
        error: 'MISSING_EMAIL',
        requestId 
      });
    }

    console.log(`📧 [${requestId}] Generating OTP for withdrawal:`, { email });
    
    const otp = generateOtp();
    
    console.log(`💾 [${requestId}] Saving OTP to database:`, { 
      email, 
      purpose: 'withdraw',
      otpLength: otp.length 
    });
    
    await saveOtp(email, otp, 'withdraw');
    
    console.log(`📤 [${requestId}] Attempting to send OTP email...`);
    
    // Enhanced email sending with error details
    const emailResult = await sendOtpMail(email, otp);
    
    console.log(`✅ [${requestId}] Withdrawal OTP sent successfully:`, {
      email,
      messageId: emailResult.messageId,
      duration: emailResult.duration
    });

    res.json({ 
      message: 'OTP sent to your email',
      success: true,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`❌ [${requestId}] Withdrawal OTP Error:`, {
      error: err.message,
      stack: err.stack,
      details: err.error || {},
      timestamp: new Date().toISOString()
    });

    // Send detailed error response
    res.status(500).json({ 
      message: err.error?.userMessage || 'Error sending OTP',
      error: {
        type: err.error?.type || 'UNKNOWN_ERROR',
        requestId,
        timestamp: new Date().toISOString(),
        // Include technical details for debugging
        technical: process.env.NODE_ENV === 'development' ? {
          originalError: err.message,
          code: err.error?.details?.code,
          response: err.error?.details?.response
        } : undefined
      }
    });
  }
});

// Verify OTP for withdrawal
router.post('/verify-withdraw-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const record = await Otp.findOne({ email, purpose: 'withdraw', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'Invalid OTP' });
    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });
    res.json({ message: 'OTP Verified' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// ========== Forgot Password OTP ========== //
// Send OTP for forgot password
router.post('/send-forgot-otp', async (req, res) => {
  const requestId = Date.now();
  console.log(`🔄 [${requestId}] Forgot Password OTP Request:`, {
    body: req.body,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  try {
    const { email } = req.body;
    
    if (!email) {
      console.warn(`⚠️ [${requestId}] Missing email in request`);
      return res.status(400).json({ 
        message: 'Email required',
        error: 'MISSING_EMAIL',
        requestId 
      });
    }

    console.log(`👤 [${requestId}] Checking if user exists:`, { email });
    
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`⚠️ [${requestId}] User not found:`, { email });
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        requestId 
      });
    }

    console.log(`📧 [${requestId}] User found, generating OTP:`, { 
      email, 
      userId: user._id 
    });
    
    const otp = generateOtp();
    
    console.log(`💾 [${requestId}] Saving OTP to database:`, { 
      email, 
      purpose: 'forgot',
      otpLength: otp.length 
    });
    
    await saveOtp(email, otp, 'forgot');
    
    console.log(`📤 [${requestId}] Attempting to send OTP email...`);
    
    // Enhanced email sending with error details
    const emailResult = await sendOtpMail(email, otp);
    
    console.log(`✅ [${requestId}] Forgot Password OTP sent successfully:`, {
      email,
      messageId: emailResult.messageId,
      duration: emailResult.duration
    });

    res.json({ 
      message: 'OTP sent to your email',
      success: true,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`❌ [${requestId}] Forgot Password OTP Error:`, {
      error: err.message,
      stack: err.stack,
      details: err.error || {},
      timestamp: new Date().toISOString()
    });

    // Send detailed error response
    res.status(500).json({ 
      message: err.error?.userMessage || 'Error sending OTP',
      error: {
        type: err.error?.type || 'UNKNOWN_ERROR',
        requestId,
        timestamp: new Date().toISOString(),
        // Include technical details for debugging
        technical: process.env.NODE_ENV === 'development' ? {
          originalError: err.message,
          code: err.error?.details?.code,
          response: err.error?.details?.response
        } : undefined
      }
    });
  }
});

// Verify OTP for forgot password
router.post('/verify-forgot-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const record = await Otp.findOne({ email, purpose: 'forgot', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'Invalid OTP' });
    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });
    res.json({ message: 'OTP Verified' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

module.exports = router;
