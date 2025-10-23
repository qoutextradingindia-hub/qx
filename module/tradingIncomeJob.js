const User = require('../models/user');
const Transaction = require('../models/transaction');
const Settings = require('../models/settings');

// Daily ROI distribution (per deposit, 1% daily until 2x)
const Deposit = require('../models/deposit');
async function runDailyROIJob() {
  try {
    const settings = await Settings.findOne();
    const roiPercent = settings?.roiPercentage || 1;
    const duration = settings?.roiDuration || 1;
    const durationUnit = settings?.roiDurationUnit || 'days';
    const deposits = await Deposit.find({ status: 'approved', isActive: true });
    for (const deposit of deposits) {
      // Check if deposit is still eligible for ROI
      if (deposit.totalPaid >= deposit.amount * 2) {
        deposit.isActive = false;
        await deposit.save();
        continue;
      }
      // Calculate ROI for this deposit
      let roi = 0;
      if (durationUnit === 'minutes') {
        roi = deposit.amount * (roiPercent / 100) * (duration / (24 * 60));
      } else if (durationUnit === 'hours') {
        roi = deposit.amount * (roiPercent / 100) * (duration / 24);
      } else {
        roi = deposit.amount * (roiPercent / 100) * duration;
      }
      // Cap ROI if it would exceed 2x
      if (deposit.totalPaid + roi > deposit.amount * 2) {
        roi = deposit.amount * 2 - deposit.totalPaid;
      }
      if (roi > 0) {
        const user = await User.findById(deposit.userId);
        if (!user) continue;
        user.balance += roi;
        user.wallet += roi;
        await user.save();
        deposit.totalPaid += roi;
        if (deposit.totalPaid >= deposit.amount * 2) deposit.isActive = false;
        await deposit.save();
        await Transaction.create({
          userId: user._id,
          amount: roi,
          type: 'trading_income',
          description: `Trading Income (1% on $${deposit.amount} deposit)`
        });

        // ✅ INLINE Referral Income Calculation (10 Levels)
        const referralLevels = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02];
        let refUserId = user.referredBy;
        
        for (let level = 0; level < 10; level++) {
          if (!refUserId) break;
          
          const refUser = await User.findById(refUserId);
          if (!refUser) break;
          
          const income = roi * referralLevels[level];
          
          // Add to referrer's balance
          refUser.balance += income;
          refUser.referralIncome = (refUser.referralIncome || 0) + income;
          await refUser.save();
          
          // Create transaction
          await Transaction.create({
            userId: refUser._id,
            fromUser: user._id,
            toUser: refUser._id,
            amount: income,
            type: "referral_on_trading",
            level: level + 1,
            description: `Level ${level + 1} Referral Income on Trading (${(referralLevels[level] * 100).toFixed(0)}%)`
          });
          
          console.log(`✅ Level ${level + 1}: $${income.toFixed(2)} to ${refUser.name} (from ${user.name}'s $${roi} trading)`);
          
          refUserId = refUser.referredBy;
        }
      }
    }
    console.log('✅ Trading income distributed (per deposit)');
  } catch (err) {
    console.error('❌ Error running ROI job:', err);
  }
}

// ✅ Calculate Referral Income on Trading Income (10 Levels)
async function calculateReferralIncomeOnTrading(userId, tradingAmount) {
  try {
    const referralLevels = [
      0.15, // Level 1: 15%
      0.12, // Level 2: 12%
      0.10, // Level 3: 10%
      0.08, // Level 4: 8%
      0.07, // Level 5: 7%
      0.06, // Level 6: 6%
      0.05, // Level 7: 5%
      0.04, // Level 8: 4%
      0.03, // Level 9: 3%
      0.02  // Level 10: 2%
    ];

    // ✅ Get the user who earned trading income
    const user = await User.findById(userId);
    if (!user) return;

    // ✅ Start from the user's referrer (NOT the user himself)
    let refUserId = user.referredBy;
    
    // ✅ Go up the referral chain (10 levels)
    for (let level = 0; level < 10; level++) {
      if (!refUserId) break; // No more referrers in chain
      
      const refUser = await User.findById(refUserId);
      if (!refUser) break; // Invalid referrer
      
      const income = tradingAmount * referralLevels[level];
      
      // ✅ Add income to referrer's balance (NOT to the original user)
      refUser.balance += income;
      refUser.referralIncome = (refUser.referralIncome || 0) + income;
      await refUser.save();
      
      // ✅ Create transaction record
      await new Transaction({
        userId: refUser._id,
        fromUser: userId, // Original user who earned trading income
        toUser: refUser._id, // Referrer who gets commission
        amount: income,
        type: "referral_on_trading",
        level: level + 1,
        description: `Level ${level + 1} Referral Income on Trading (${(referralLevels[level] * 100).toFixed(0)}%)`
      });
      
      console.log(`Level ${level + 1} referral income: $${income.toFixed(2)} to ${refUser.name} (from ${user.name}'s $${tradingAmount} trading income)`);
      
      // ✅ Move to next level (referrer's referrer)
      refUserId = refUser.referredBy;
    }
  } catch (error) {
    console.error('Error calculating referral income on trading:', error);
  }
}

// 3-level referral income distribution (DEPRECATED - Now handled on deposit approval)
// This function is no longer used in cron job
async function runReferralIncomeJob() {
  console.log('⚠️  Referral income job is DEPRECATED - referral income now happens on deposit approval only');
  return;
}

module.exports = {
  runDailyROIJob,
  runReferralIncomeJob
};
