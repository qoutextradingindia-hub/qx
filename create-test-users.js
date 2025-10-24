require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.log("❌ MongoDB error:", err));

// Helper to generate unique referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Create test users
async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Test User 1
    const user1 = new User({
      name: 'Test User 1',
      email: 'test1@example.com',
      password: 'password123',
      balance: 1000,
      wallet: 1000,
      depositedAmount: 1000,
      referralCode: generateReferralCode()
    });
    await user1.save();
    console.log('✅ User 1 created:', user1.name, 'ID:', user1._id);

    // Test User 2 (referred by User 1)
    const user2 = new User({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      balance: 500,
      wallet: 500,
      depositedAmount: 500,
      referredBy: user1._id,
      referralCode: generateReferralCode()
    });
    await user2.save();
    console.log('✅ User 2 created:', user2.name, 'ID:', user2._id);

    // Test User 3 (referred by User 2)
    const user3 = new User({
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'password123',
      balance: 750,
      wallet: 750,
      depositedAmount: 750,
      referredBy: user2._id,
      referralCode: generateReferralCode()
    });
    await user3.save();
    console.log('✅ User 3 created:', user3.name, 'ID:', user3._id);

    // Admin User
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@startraders.com',
      password: 'admin123',
      balance: 10000,
      wallet: 10000,
      depositedAmount: 10000,
      referralCode: generateReferralCode()
    });
    await adminUser.save();
    console.log('✅ Admin user created:', adminUser.name, 'ID:', adminUser._id);

    console.log('\n🎉 All test users created successfully!');
    console.log('Now you can see users in the admin panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

// Run the script
createTestUsers();