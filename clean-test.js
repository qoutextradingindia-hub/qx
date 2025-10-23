const { sendOtpMail } = require('./utils/sendMail');

const testEmail = async () => {
  try {
    console.log('📤 Sending test email...');
    await sendOtpMail('luckyparihar3111crypto@gmail.com', '123456');
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};

testEmail();
