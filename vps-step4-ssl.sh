# StarTraders VPS Complete Setup - Step 4
# SSL Certificate and Domain Configuration

# IMPORTANT: Before running this script, make sure DNS is configured:
# Domain: qxtrand.onrender.com should point to 31.97.207.160

echo "🔒 Starting SSL setup for qxtrand.onrender.com..."

# 1. Check if domain is pointing to this server
echo "🔍 Checking DNS configuration..."
nslookup qxtrand.onrender.com
echo "⚠️  Make sure the above shows IP: 31.97.207.160"
echo "If not, configure DNS first and wait for propagation (5-30 minutes)"

read -p "Is DNS configured correctly? (y/n): " dns_ready
if [ "$dns_ready" != "y" ]; then
    echo "❌ Please configure DNS first:"
    echo "1. Go to your domain registrar (Hostinger)"
    echo "2. Add A record: @ -> 31.97.207.160"
    echo "3. Add A record: www -> 31.97.207.160"
    echo "4. Wait for DNS propagation and run this script again"
    exit 1
fi

# 2. Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot --nginx \
    -d qxtrand.onrender.com \
    -d qxtrand.onrender.com \
    --non-interactive \
    --agree-tos \
    --email admin@qxtrand.onrender.com \
    --redirect

# 3. Test SSL auto-renewal
echo "🔄 Testing SSL auto-renewal..."
sudo certbot renew --dry-run

# 4. Setup automatic renewal
echo "⏰ Setting up automatic SSL renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 5. Final test
echo "🧪 Testing final setup..."
sleep 5

# Test HTTP redirect to HTTPS
echo "Testing HTTP to HTTPS redirect..."
curl -I http://qxtrand.onrender.com 2>/dev/null | head -n 1

# Test HTTPS
echo "Testing HTTPS..."
curl -I https://qxtrand.onrender.com 2>/dev/null | head -n 1

# 6. Display final status
echo ""
echo "🎉 ================================="
echo "✅ STARTRADERS DEPLOYMENT COMPLETED!"
echo "🌐 Website: https://qxtrand.onrender.com"
echo "🔧 Backend API: https://qxtrand.onrender.com/api"
echo "🔒 SSL: Enabled with auto-renewal"
echo "⚡ Backend: Running with PM2"
echo "🎉 ================================="
echo ""

# Show PM2 status
echo "📊 Backend Status:"
pm2 status

echo "🌐 NGINX Status:"
sudo systemctl status nginx --no-pager

echo "🔒 SSL Certificate Status:"
sudo certbot certificates

echo ""
echo "🔧 Management Commands:"
echo "pm2 status          - Check backend"
echo "pm2 restart all     - Restart backend"
echo "pm2 logs           - View backend logs"
echo "sudo nginx -t      - Test nginx config"
echo "sudo systemctl reload nginx - Reload nginx"
