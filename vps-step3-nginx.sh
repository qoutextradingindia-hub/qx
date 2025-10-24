# StarTraders VPS Complete Setup - Step 3
# NGINX Configuration with Domain

# 1. Create NGINX config for StarTraders
echo "🌐 Creating NGINX configuration..."
sudo tee /etc/nginx/sites-available/startraders > /dev/null <<'EOF'
server {
    listen 80;
    server_name qxtrand.onrender.com qxtrand.onrender.com 31.97.207.160;
    
    # Root directory for React build files
    root /var/www/html;
    index index.html;

    # Frontend - Serve React app
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Backend auth routes (adjust based on your routes)
    location ~ ^/(auth|login|register|user) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

# 2. Enable the site
echo "🔗 Enabling StarTraders site..."
sudo ln -sf /etc/nginx/sites-available/startraders /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Test NGINX configuration
echo "🧪 Testing NGINX configuration..."
sudo nginx -t

# 4. Restart NGINX if config is valid
if [ $? -eq 0 ]; then
    echo "✅ NGINX config is valid! Restarting NGINX..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    echo "❌ NGINX config has errors!"
    exit 1
fi

# 5. Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "🎉 Step 3 completed! NGINX configured successfully."
echo "🌐 Test your site: http://31.97.207.160"
