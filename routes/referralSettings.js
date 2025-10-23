const express = require('express');
const router = express.Router();
const ReferralSettings = require('../models/referralSettings');

// Get referral settings
router.get('/api/admin/referral-settings', async (req, res) => {
  try {
    let settings = await ReferralSettings.findOne();
    if (!settings) settings = await ReferralSettings.create({});
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch referral settings' });
  }
});

// Update referral settings
router.post('/api/admin/referral-settings', async (req, res) => {
  try {
    let settings = await ReferralSettings.findOne();
    if (!settings) settings = new ReferralSettings({});
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update referral settings' });
  }
});

module.exports = router;
