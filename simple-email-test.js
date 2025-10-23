// 🧪 Simple VPS Email Test - Backup Version
// If main test-email.js doesn't work, use this

const nodemailer = require('nodemailer');

console.log('🧪 Simple Email Test Starting...');

// Direct transporter (no external files)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'starttradersnoreply@gmail.com',
    pass: 'yroe trjv tidg qoqc'
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false
});

// Send test email
transporter.sendMail({
  from: 'starttradersnoreply@gmail.com',
  to: 'luckyparihar3111crypto@gmail.com',
  subject: '✅ Simple VPS Test Email',
  text: 'This is a simple email test from VPS. If you receive this, SMTP is working!'
}, function(error, info) {
  if (error) {
    console.error('❌ Email failed:', error.message);
    console.error('Code:', error.code);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  }
});
