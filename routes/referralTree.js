const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get 3-level referral tree for a user
router.get('/api/admin/referral-tree/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('name email balance depositedAmount wallet');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Level 1
    const level1 = await User.find({ referredBy: userId }).select('name email balance depositedAmount wallet');
    // Level 2
    const level1Ids = level1.map(u => u._id);
    const level2 = await User.find({ referredBy: { $in: level1Ids } }).select('name email balance depositedAmount wallet referredBy');
    // Level 3
    const level2Ids = level2.map(u => u._id);
    const level3 = await User.find({ referredBy: { $in: level2Ids } }).select('name email balance depositedAmount wallet referredBy');

    res.json({
      success: true,
      user,
      level1,
      level2,
      level3
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch referral tree' });
  }
});

module.exports = router;
