const sendMail = require('./utils/sendMail');

const testEmail = async () => {
  try {
    console.log('✅ VPS Email Test Starting...');
    await sendMail.sendOtpMail('luckyparihar3111crypto@gmail.com', '123456');
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};

testEmail();
