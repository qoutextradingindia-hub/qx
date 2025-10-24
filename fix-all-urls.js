const fs = require('fs');
const path = require('path');

// Replace all old URLs with new backend URL
const replaceInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all old backend URLs with new one
    content = content.replace(/https:\/\/qx-yb3z\.onrender\.com/g, 'https://qxtrand.onrender.com');
    content = content.replace(/https:\/\/startraders-fullstack\.onrender\.com/g, 'https://qxtrand.onrender.com');
    content = content.replace(/https:\/\/startradersindia\.in\/api/g, 'https://qxtrand.onrender.com/api');
    content = content.replace(/http:\/\/localhost:5000\/api/g, 'https://qxtrand.onrender.com/api');
    
    // For registration links, keep frontend URL
    content = content.replace(/https:\/\/qx-yb3z\.onrender\.com\/register/g, 'https://qxtrand.onrender.com/register');
    content = content.replace(/https:\/\/startradersindia\.in\/register/g, 'https://qxtrand.onrender.com/register');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } catch (err) {
    console.log(`❌ Error fixing ${filePath}:`, err.message);
    return false;
  }
};

// Files to fix
const filesToFix = [
  'client/src/apiHelpers.js',
  'client/src/BoostingTimer.js', 
  'client/src/Dashboard.js',
  'client/src/Earning.js',
  'client/src/ForgotPassword.jsx',
  'client/src/Referral.jsx',
  'client/src/ReferralOnTrading.js',
  'client/src/Trading.js',
  'client/src/USDTDepositpage.js',
  'client/src/USDTWithdrawalPage.js',
  'client/src/admin/Deposits.jsx',
  'client/src/admin/OfflineGateway.js',
  'client/src/admin/pages/UserDetail.jsx',
  'client/src/admin/Withdrawals.jsx'
];

console.log('🔧 Fixing all API URLs...');

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    replaceInFile(fullPath);
  } else {
    console.log(`⚠️ File not found: ${fullPath}`);
  }
});

console.log('✅ All URLs fixed!');