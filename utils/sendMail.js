const nodemailer = require('nodemailer');

// 🔧 Simple Gmail SMTP Transporter for VPS Testing
const createEmailTransporter = () => {
  console.log('🚀 Creating Gmail SMTP Transporter...');
  
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'starttradersnoreply@gmail.com',
      pass: 'yroe trjv tidg qoqc' // Gmail App Password
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    debug: true,   // Enable debug logs
    logger: true,  // Enable logging
    tls: {
      rejectUnauthorized: false
    }
  });
};

// 📧 Enhanced OTP Send Function with debugging
async function sendOtpMail(email, otp) {
  console.log('🔄 Starting OTP Email Send Process:', {
    email: email,
    otpLength: otp ? otp.length : 'undefined',
    timestamp: new Date().toISOString()
  });

  try {
    // Validate inputs
    if (!email) {
      throw new Error('Recipient email is required');
    }
    if (!otp) {
      throw new Error('OTP is required');
    }

    console.log('✅ Inputs validated successfully');

    // Create transporter
    const transporter = createEmailTransporter();

    // Mail options
    const mailOptions = {
      from: 'starttradersnoreply@gmail.com',
      to: email,
      subject: 'Your OTP - Star Traders',
      text: `Your OTP is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Star Traders - OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #333; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        </div>
      `
    };

    console.log('📧 Mail Options Prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      timestamp: new Date().toISOString()
    });

    // Send email
    console.log('📤 Attempting to send email via SMTP...');
    const startTime = Date.now();
    
    const info = await transporter.sendMail(mailOptions);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      duration,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    // Comprehensive Error Logging
    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      timestamp: new Date().toISOString()
    };

    console.error('❌ Email Send Failed:', errorDetails);

    // Network Issues
    if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Connection Refused - VPS Firewall या Network Issue:', {
        possibleCauses: [
          'VPS firewall blocking SMTP port 587',
          'ISP blocking outgoing SMTP traffic',
          'Network connectivity issues'
        ],
        solutions: [
          'Check: telnet smtp.gmail.com 587',
          'Check: ufw status',
          'Contact VPS provider about SMTP restrictions'
        ]
      });
    }

    // Authentication Issues
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('🔐 Authentication Failed - Gmail App Password Issue:', {
        possibleCauses: [
          'Gmail App Password not generated',
          'Incorrect credentials',
          '2FA not enabled'
        ],
        solutions: [
          'Generate Gmail App Password',
          'Enable 2FA on Gmail',
          'Use App Password (not regular password)'
        ]
      });
    }

    // DNS Issues
    if (error.code === 'ENOTFOUND') {
      console.error('🔍 DNS Resolution Failed:', {
        issue: 'Cannot resolve smtp.gmail.com',
        solutions: [
          'Check: nslookup smtp.gmail.com',
          'Check VPS DNS configuration'
        ]
      });
    }

    // Timeout Issues
    if (error.code === 'ETIMEDOUT') {
      console.error('⏱️ Connection Timeout:', {
        issue: 'SMTP connection timed out',
        solutions: [
          'Check network speed',
          'Try different SMTP port'
        ]
      });
    }

    // Return error for API
    throw {
      success: false,
      error: {
        type: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: errorDetails,
        userMessage: 'Failed to send OTP email. Please try again.',
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = { createEmailTransporter, sendOtpMail };
