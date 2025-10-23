# Startraders Project Deployment Script

#!/bin/bash

echo "🚀 Starting Startraders VPS Deployment..."

# Create project directory
mkdir -p /var/www/startraders
cd /var/www/startraders

# Clone your GitHub repository
git clone https://github.com/luckyparihar3111-crypto/Startraders.git .

# Install backend dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Build React app for production
cd client
npm run build
cd ..

# Copy built files to nginx directory
sudo cp -r client/build/* /var/www/html/

# Create PM2 ecosystem file for backend
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'startraders-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start backend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Project deployed successfully!"
echo "🌐 Frontend: http://31.97.207.160"
echo "🔧 Backend: http://31.97.207.160:3001"
