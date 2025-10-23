const mongoose = require('mongoose');
const User = require('../module/user');
const Transaction = require('../module/Transaction');
const tradingIncomeJob = require('../module/tradingIncomeJob');

describe('Trading Income Cron Job', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should credit 1% trading income to all users', async () => {
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'test123',
      balance: 1000,
    });
    await testUser.save();

    // Run the cron job function directly
    await tradingIncomeJob.__testRun && tradingIncomeJob.__testRun();

    // Fetch updated user
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.balance).toBeCloseTo(1010, 1); // 1% of 1000 = 10

    // Check transaction
    const txn = await Transaction.findOne({ userId: testUser._id, type: 'trading_income' });
    expect(txn).toBeTruthy();
    expect(txn.amount).toBeCloseTo(10, 1);

    // Cleanup
    await Transaction.deleteMany({ userId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
  });
});
