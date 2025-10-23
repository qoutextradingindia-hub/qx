// ===== Webhook Route for GitHub Auto Deploy =====
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const router = express.Router();

const GITHUB_SECRET = process.env.GITHUB_SECRET || 'mygithub@webhook999';

// Middleware to verify GitHub signature
function verifyGitHubSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', GITHUB_SECRET)
    .update(buf)
    .digest('hex')}`;

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature.');
  }
}

// Body parser with raw buffer
const bodyParser = require('body-parser');
router.use(bodyParser.json({ verify: verifyGitHubSignature }));

// POST /api/github-webhook
router.post('/', (req, res) => {
  console.log('✅ GitHub webhook received. Pulling changes...');

  // Pull latest code and restart PM2
  exec('git pull origin main && npm install && pm2 restart server', { cwd: '/root/startraders-fullstack-main' }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Git Pull Error:', err.message);
      return res.status(500).send('Git Pull Failed');
    }
    console.log('✅ Git Pull Output:', stdout);
    return res.status(200).send('Updated!');
  });
});

module.exports = router;
