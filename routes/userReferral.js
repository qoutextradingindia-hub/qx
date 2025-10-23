const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Deposit = require('../models/deposit');
const Transaction = require('../models/transaction');

// GET /api/user/referral-overview/:userId
router.get('/api/user/referral-overview/:userId', async (req, res) => {
  try {
    console.log("[Referral API] Called for user:", req.params.userId);
    const userId = req.params.userId;
    // Level 1, 2, 3 referrals
    const level1 = await User.find({ referredBy: userId });
    const level1Ids = level1.map(u => u._id.toString());
    const level2 = await User.find({ referredBy: { $in: level1Ids } });
    const level2Ids = level2.map(u => u._id.toString());
    const level3 = await User.find({ referredBy: { $in: level2Ids } });
    const allRefs = [...level1, ...level2, ...level3];

    // Deposit status
    const deposits = await Deposit.find({ userId: { $in: allRefs.map(u => u._id) } });
    const depositMap = {};
    deposits.forEach(dep => { depositMap[dep.userId.toString()] = dep; });

    // Income transactions (referral commissions)
    const incomes = await Transaction.find({ toUser: userId, type: /referral/ }).populate('fromUser', 'name email');

    // Commission per referral (map: referralUserId -> commission amount)
    const commissionMap = {};
    incomes.forEach(txn => {
      if (txn.fromUser && txn.fromUser._id) {
        const refId = txn.fromUser._id.toString();
        commissionMap[refId] = (commissionMap[refId] || 0) + txn.amount;
      }
    });

    // Level-wise summary
    const levelSummary = [
      { users: 0, investment: 0, earnings: 0 },
      { users: 0, investment: 0, earnings: 0 },
      { users: 0, investment: 0, earnings: 0 },
    ];

    // Prepare referral list with commission and status
    const referralList = allRefs.map(u => {
      const idStr = u._id.toString();
      const level = level1Ids.includes(idStr) ? 1 : level2Ids.includes(idStr) ? 2 : 3;
      const depositedAmount = u.depositedAmount || 0;
      const commission = commissionMap[idStr] || 0;
      const active = !!(depositMap[idStr] && depositMap[idStr].status === 'approved');
      // Update level summary
      levelSummary[level-1].users += 1;
      levelSummary[level-1].investment += depositedAmount;
      levelSummary[level-1].earnings += commission;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        level,
        joined: u.createdAt,
        depositedAmount,
        commission,
        active,
        depositStatus: depositMap[idStr]?.status || 'none',
      };
    });

    // Level-wise income (for backward compatibility)
    const levelIncome = [0, 0, 0];
    incomes.forEach(txn => {
      if (txn.level && txn.level >= 1 && txn.level <= 3) levelIncome[txn.level - 1] += txn.amount;
    });

    // Format income history: date, level, amount, source user
    const incomeHistory = incomes.map(txn => ({
      _id: txn._id,
      date: txn.createdAt,
      level: txn.level,
      amount: txn.amount,
      sourceUser: txn.fromUser ? { name: txn.fromUser.name, email: txn.fromUser.email } : null,
      description: txn.description || '',
    }));

    const responseData = {
      success: true,
      totalReferrals: allRefs.length,
      levelCounts: [level1.length, level2.length, level3.length],
      referralList,
      levelIncome,
      totalIncome: levelIncome.reduce((a, b) => a + b, 0),
      levelSummary,
      incomeHistory,
    };
    console.log("[Referral API] Response:", JSON.stringify(responseData));
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch referral overview' });
  }
});

module.exports = router;
