#!/bin/bash
# Quick Fix Script - Replace all hardcoded Render URLs with API helper calls

echo "🔧 Fixing hardcoded URLs in StarTraders frontend..."

# Navigate to client src directory
cd client/src

echo "📝 Files to be updated:"
grep -r "startraders-fullstack.onrender.com" . --include="*.js" --include="*.jsx" | cut -d: -f1 | sort | uniq

echo ""
echo "🔄 Starting replacements..."

# Register.jsx
echo "Fixing Register.jsx..."
sed -i "s|https://qxtrand.onrender.com/api/register|process.env.REACT_APP_API_BASE_URL + '/register'|g" Register.jsx

# Dashboard.js  
echo "Fixing Dashboard.js..."
sed -i "s|https://qxtrand.onrender.com/api/admin/user/|process.env.REACT_APP_API_BASE_URL + '/admin/user/'|g" Dashboard.js
sed -i "s|https://qxtrand.onrender.com/api/user/referral-income/|process.env.REACT_APP_API_BASE_URL + '/user/referral-income/'|g" Dashboard.js

# ReferralIncome.js
echo "Fixing ReferralIncome.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/referral-income/|process.env.REACT_APP_API_BASE_URL + '/user/referral-income/'|g" ReferralIncome.js

# USDTDepositpage.jsx
echo "Fixing USDTDepositpage.jsx..."
sed -i "s|https://qxtrand.onrender.com/api/user/deposit-settings|process.env.REACT_APP_API_BASE_URL + '/user/deposit-settings'|g" USDTDepositpage.jsx
sed -i "s|https://qxtrand.onrender.com/api/user/deposit|process.env.REACT_APP_API_BASE_URL + '/user/deposit'|g" USDTDepositpage.jsx

# USDTWithdrawalPage.js
echo "Fixing USDTWithdrawalPage.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/withdrawal|process.env.REACT_APP_API_BASE_URL + '/user/withdrawal'|g" USDTWithdrawalPage.js

# TransactionHistory.jsx
echo "Fixing TransactionHistory.jsx..."
sed -i "s|https://qxtrand.onrender.com/api/user/transactions/|process.env.REACT_APP_API_BASE_URL + '/user/transactions/'|g" TransactionHistory.jsx

# Trading.js
echo "Fixing Trading.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/trading-income/|process.env.REACT_APP_API_BASE_URL + '/user/trading-income/'|g" Trading.js

# Team.js
echo "Fixing Team.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/referral-overview/|process.env.REACT_APP_API_BASE_URL + '/user/referral-overview/'|g" Team.js

# setupProxy.js
echo "Fixing setupProxy.js..."
sed -i "s|https://qxtrand.onrender.com|https://qxtrand.onrender.com|g" setupProxy.js

# ReferralOnTrading.js
echo "Fixing ReferralOnTrading.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/referral-trading-income|process.env.REACT_APP_API_BASE_URL + '/user/referral-trading-income'|g" ReferralOnTrading.js

# Referral.jsx
echo "Fixing Referral.jsx..."
sed -i "s|https://qxtrand.onrender.com/api/user/referral-overview/|process.env.REACT_APP_API_BASE_URL + '/user/referral-overview/'|g" Referral.jsx

# Earning.js
echo "Fixing Earning.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/transactions/|process.env.REACT_APP_API_BASE_URL + '/user/transactions/'|g" Earning.js

# BoostingTimer.js
echo "Fixing BoostingTimer.js..."
sed -i "s|https://qxtrand.onrender.com/api/user/check-boosting/|process.env.REACT_APP_API_BASE_URL + '/user/check-boosting/'|g" BoostingTimer.js

# Admin files
echo "Fixing admin files..."
cd admin
sed -i "s|https://qxtrand.onrender.com/api/admin/|process.env.REACT_APP_API_BASE_URL + '/admin/'|g" *.jsx
cd ..

echo ""
echo "✅ All hardcoded URLs have been replaced!"
echo "🔧 Next steps:"
echo "1. npm run build"
echo "2. Copy build files to VPS"
echo "3. Restart nginx"

echo ""
echo "🧪 Verification - URLs should now point to:"
echo "Production: https://qxtrand.onrender.com/api"
echo "Development: http://localhost:3000/api" 
