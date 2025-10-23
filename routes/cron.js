const express = require('express');
const router = express.Router();

// Import your job functions (update the path if needed)
const { runDailyROIJob, runReferralIncomeJob } = require('../module/tradingIncomeJob');

// GET /api/cron/run?key=123456
router.get('/api/cron/run', async (req, res) => {
  try {
    if (req.query.key !== '123456') {
      return res.status(403).send('403 Access Denied');
    }
    // Only run daily trading income - NOT referral income
    await runDailyROIJob();
    
    // Referral income should only happen on deposit, not daily
    // await runReferralIncomeJob(); // COMMENTED OUT
    
    res.send('✅ Trading income distributed (referral income happens on deposit only)');
  } catch (err) {
    console.error('Cron API error:', err);
    res.status(500).send('❌ कुछ गड़बड़ हो गई');
  }
});

module.exports = router;
