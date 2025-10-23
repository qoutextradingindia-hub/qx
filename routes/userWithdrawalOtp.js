const express = require('express');
const router = express.Router();
const Otp = require('../models/otp');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Send OTP for withdrawal
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });
  // Invalidate old OTPs for withdrawal
  await Otp.deleteMany({ email, purpose: 'withdrawal' });
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Otp.create({ email, otpHash, purpose: 'withdrawal', expiresAt });
  // Send email
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your OTP for Withdrawal',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    });
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP for withdrawal
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.json({ success: false, message: 'All fields required' });
  const otpDoc = await Otp.findOne({ email, purpose: 'withdrawal' });
  if (!otpDoc) return res.json({ success: false, message: 'OTP not found' });
  if (otpDoc.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otpDoc._id });
    return res.json({ success: false, message: 'OTP expired' });
  }
  const match = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!match) return res.json({ success: false, message: 'Invalid OTP' });
  await Otp.deleteOne({ _id: otpDoc._id });
  res.json({ success: true, message: 'OTP verified' });
});

module.exports = router;
