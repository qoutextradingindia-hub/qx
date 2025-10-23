const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Otp = require('../models/otp');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Send OTP
router.post('/api/user/send-otp', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otpCode, 10);
  await Otp.deleteMany({ email, purpose: 'forgot-password' }); // Remove old OTPs for this email/purpose
  await Otp.create({
    email,
    otpHash,
    purpose: 'forgot-password',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'yourgmail@gmail.com', pass: 'yourapppassword' }
  });
  await transporter.sendMail({
    from: 'Star Traders <yourgmail@gmail.com>',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is ${otpCode}. It is valid for 5 minutes.`
  });

  res.json({ message: 'OTP sent to your email' });
});

// Reset Password
router.post('/api/user/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otpDoc = await Otp.findOne({ email, purpose: 'forgot-password' });
  if (!otpDoc) return res.status(400).json({ message: 'Invalid OTP' });
  const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });
  if (Date.now() > otpDoc.expiresAt) return res.status(400).json({ message: 'OTP expired' });

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  await Otp.deleteMany({ email, purpose: 'forgot-password' }); // Remove used OTPs

  res.json({ message: 'Password reset successful' });
});

module.exports = router;
