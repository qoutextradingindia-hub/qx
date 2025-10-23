const { createEmailTransporter } = require('./utils/sendMail');

console.log('🧪 VPS Email Test Starting...');
console.log('================================');

async function sendTestEmail() {
  try {
    console.log('📧 Creating email transporter...');
    const transporter = createEmailTransporter();

    console.log('📤 Sending test email...');
    let info = await transporter.sendMail({
      from: '"StarTraders Test" <starttradersnoreply@gmail.com>',
      to: 'luckyparihar3111crypto@gmail.com',
      subject: '✅ VPS Email Test Success - StarTraders',
      text: '🎉 If you received this, SMTP and nodemailer are working perfectly on your VPS!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #28a745;">🎉 VPS Email Test Successful!</h2>
          <p>✅ Your Gmail SMTP is working correctly on VPS</p>
          <p>📧 From: StarTraders VPS</p>
          <p>⏰ Time: ${new Date().toLocaleString()}</p>
          <p>🌐 Server: ${process.env.NODE_ENV || 'VPS Environment'}</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    console.log('🎯 Test completed - Check your inbox!');

  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('🔍 Error code:', error.code);
    console.error('📋 Full error:', error);
  }
}

sendTestEmail();