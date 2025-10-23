# StarTraders VPS Complete Setup - Step 1
# Copy-paste each command block one by one

# 1. System Update
echo "🔄 Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18 LTS
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install additional tools
echo "🔧 Installing essential tools..."
sudo apt install -y git nginx certbot python3-certbot-nginx ufw

# 4. Install PM2 globally
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# 5. Check installations
echo "✅ Checking versions..."
node -v
npm -v
pm2 -v
nginx -v

echo "🎉 Step 1 completed! Basic setup done."
