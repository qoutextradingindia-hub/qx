const express = require('express');
const router = express.Router();
const Otp = require('../models/otp');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// /test-mail route: Send OTP to example@gmail.com
router.get('/test-mail', async (req, res) => {
  try {
    const email = 'example@gmail.com';
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Remove old OTPs for this email/purpose
    await Otp.deleteMany({ email, purpose: 'test-mail' });
    // Save OTP with 5 min expiry
    await Otp.create({
      email,
      otpHash,
      purpose: 'test-mail',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Nodemailer Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `Star Traders <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Test - Star Traders',
      text: `Your OTP is: ${otpCode}`
    });

    res.json({ message: 'Mail Sent' });
  } catch (err) {
    console.error('Mail Failed:', err);
    res.status(500).json({ message: 'Mail Failed' });
  }
});

module.exports = router;
