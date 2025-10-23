# StarTraders VPS Complete Setup - Step 2
# Project clone and backend setup

# 1. Clone your project
echo "📥 Cloning StarTraders project..."
cd ~
git clone https://github.com/luckyparihar3111-crypto/Startraders.git
cd Startraders

# 2. Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# 3. Install client dependencies and build
echo "🏗️ Building frontend..."
cd client
npm install
npm run build
cd ..

# 4. Copy built files to nginx directory
echo "📂 Deploying frontend..."
sudo rm -rf /var/www/html/*
sudo cp -r client/build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# 5. Start backend with PM2
echo "🚀 Starting backend with PM2..."
pm2 start server.js --name startraders-backend
pm2 save
pm2 startup

echo "🎉 Step 2 completed! Project deployed and backend running."
echo "📊 Backend status:"
pm2 status
