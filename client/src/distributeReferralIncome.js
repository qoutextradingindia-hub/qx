
// 👇 Add this function to your server.js
async function distributeReferralIncome(fromUserId, referrerId, amount) {
  let level = 1;
  let currentReferrer = referrerId;
  const levelPercents = [0.10, 0.05, 0.02]; // 10%, 5%, 2%

  while (currentReferrer && level <= 3) {
    const refUser = await User.findById(currentReferrer);
    if (!refUser) break;

    const incomeAmount = amount * levelPercents[level - 1];

    refUser.balance += incomeAmount;
    refUser.totalEarned += incomeAmount;
    await refUser.save();

    await ReferralIncome.create({
      userId: refUser._id,
      fromUser: fromUserId,
      amount: incomeAmount,
      level
    });

    currentReferrer = refUser.referrer;
    level++;
  }
}
