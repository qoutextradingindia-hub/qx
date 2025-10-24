require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS Configuration for StarTraders Frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://startradersindia.in',
    'https://startradersindia.in',
    'http://www.startradersindia.in',
    'https://www.startradersindia.in',
    'http://31.97.207.160',
    'https://31.97.207.160',
    'https://qxtrand.onrender.com',
    'https://qx-yb3z.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Add security headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('X-Powered-By', 'StarTraders API');
  next();
});

// OTP API for withdrawal and forgot password (must be after app is initialized)
const userOtpRouter = require('./routes/userOtp');
app.use('/api/user', userOtpRouter);
// Test Mail API
const testMailRouter = require('./routes/test');
app.use(testMailRouter);

// User Referral Overview API
const userReferralRouter = require('./routes/userReferral');
app.use(userReferralRouter);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Referral Tree API
const referralTreeRouter = require('./routes/referralTree');
app.use(referralTreeRouter);

// CRON API for daily ROI and referral income
const cronRouter = require('./routes/cron');
app.use(cronRouter);

// Referral Settings API
const referralSettingsRouter = require('./routes/referralSettings');
app.use(referralSettingsRouter);

// GitHub Webhook API for automated deployment
const githubWebhook = require('./routes/github');
app.use('/api/github-webhook', githubWebhook);

// Health Check / Ping Route - Keep Render awake
app.get('/api/ping', (req, res) => {
  res.status(200).send('PONG OK');
});

// Forgot Password & OTP API
const userForgotRouter = require('./routes/userForgot');
app.use(userForgotRouter);

// Multer + Cloudinary: QR image file upload (for admin panel)
const multer = require('multer');
const { Readable } = require('stream');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/admin/upload-qr', upload.single('qr'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  try {
    const stream = Readable.from(req.file.buffer);
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'startraders/qr' }, (error, result) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message || error });
      }
      res.json({ success: true, url: result.secure_url });
    });
    stream.pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://Lucky1616:Lucky9999@cluster0.kcrnhab.mongodb.net/Lucky1616?retryWrites=true&w=majority';

// Debug logging
console.log("🔍 Environment check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("Using connection string:", mongoUri ? "✅ Valid" : "❌ Invalid");

if (!mongoUri || mongoUri === 'undefined') {
  console.error("❌ CRITICAL: No valid MongoDB URI found!");
  console.log("📋 Using fallback connection string");
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => {
  console.log("❌ MongoDB connection error:", err.message);
  console.log("🔍 Connection string used:", mongoUri ? mongoUri.substring(0, 20) + "..." : "UNDEFINED");
});

// Import models from models folder
const User = require('./models/user');
const Transaction = require('./models/transaction');
const Deposit = require('./models/deposit');
const Settings = require('./models/settings');
const Withdrawal = require('./models/withdrawal');
// User: Submit Withdrawal Request
app.post('/api/user/withdrawal', async (req, res) => {
  try {
    const { userId, amount, wallet, otp } = req.body;
    if (!userId || !amount || isNaN(amount)) return res.status(400).json({ success: false, message: 'Invalid data' });
    const user = await User.findById(userId);
    if (!user || user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
    // OTP verification for withdrawal
    const Otp = require('./models/otp');
    const otpDoc = await Otp.findOne({ email: user.email, purpose: 'withdrawal' });
    if (!otpDoc) return res.status(400).json({ success: false, message: 'OTP not found' });
    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    await Otp.deleteOne({ _id: otpDoc._id });
    user.balance -= amount;
    await user.save();
    const withdrawal = new Withdrawal({ userId, amount, wallet });
    await withdrawal.save();
    await new Transaction({ userId, amount, type: 'debit', description: 'Withdrawal Request' }).save();
    res.json({ success: true, message: 'Withdrawal request submitted' });
  } catch (err) {
    console.error('Withdrawal request error:', err);
    res.status(500).json({ success: false, message: 'Withdrawal error' });
  }
});

// Admin: Get all withdrawal requests
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (err) {
    console.error('Fetch withdrawals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  }
});

// Admin: Approve withdrawal
app.post('/api/admin/approve-withdrawal', async (req, res) => {
  try {
    const { id } = req.body;
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal || withdrawal.status !== 'pending') return res.status(404).json({ success: false, message: 'Invalid withdrawal' });
    withdrawal.status = 'approved';
    await withdrawal.save();
    res.json({ success: true, message: 'Withdrawal approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve withdrawal' });
  }
});

// Admin: Reject withdrawal
app.post('/api/admin/reject-withdrawal', async (req, res) => {
  try {
    const { id, adminNote } = req.body;
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal || withdrawal.status !== 'pending') return res.status(404).json({ success: false, message: 'Invalid withdrawal' });
    withdrawal.status = 'rejected';
    withdrawal.adminNote = adminNote || '';
    await withdrawal.save();
    // Optionally refund user
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.balance += withdrawal.amount;
      await user.save();
      await new Transaction({ userId: user._id, amount: withdrawal.amount, type: 'credit', description: 'Withdrawal Rejected - Refunded' }).save();
    }
    res.json({ success: true, message: 'Withdrawal rejected and refunded' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject withdrawal' });
  }
});
// Get Trading Income Settings
// Get Trading Income & Deposit Settings (for admin)
app.get('/api/admin/trading-income-settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Admin: Update deposit address and QR codes (deposit, buy)
app.post('/api/admin/deposit-settings', async (req, res) => {
  try {
    const { depositAddress, depositQrCode, buyQrCode } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});
    if (depositAddress !== undefined) settings.depositAddress = depositAddress;
    if (depositQrCode !== undefined) settings.depositQrCode = depositQrCode;
    if (buyQrCode !== undefined) settings.buyQrCode = buyQrCode;
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update deposit settings' });
  }
});

// User: Get deposit address and QR codes (deposit, buy)
app.get('/api/user/deposit-settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) return res.json({ success: true, depositAddress: '', depositQrCode: '', buyQrCode: '' });
    res.json({
      success: true,
      depositAddress: settings.depositAddress || '',
      depositQrCode: settings.depositQrCode || '',
      buyQrCode: settings.buyQrCode || ''
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch deposit settings' });
  }
});

// Update Trading Income Settings
app.post('/api/admin/trading-income-settings', async (req, res) => {
  try {
    const { roiPercentage, roiDuration, roiFrequency } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }
    if (roiPercentage !== undefined) settings.roiPercentage = roiPercentage;
    if (roiDuration !== undefined) settings.roiDuration = roiDuration;
    if (roiFrequency !== undefined) settings.roiFrequency = roiFrequency;
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// ✅ Register
// Helper to generate unique referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

app.post('/api/register', async (req, res) => {
  const { name, email, password, sponsorId } = req.body;
  console.log("[REGISTER] sponsorId received:", sponsorId);
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // --- STRONG sponsorId validation: must be valid ObjectId AND exist in DB ---
    let referredByValue = null;
    if (sponsorId) {
      if (!/^[a-fA-F0-9]{24}$/.test(sponsorId)) {
        console.log('[REGISTER] sponsorId invalid format:', sponsorId);
        return res.status(400).json({ success: false, message: 'Invalid sponsorId format' });
      }
      const sponsorUser = await User.findById(sponsorId);
      if (!sponsorUser) {
        console.log('[REGISTER] sponsorId not found in DB:', sponsorId);
        return res.status(400).json({ success: false, message: 'Invalid sponsorId: user not found' });
      }
      referredByValue = sponsorUser._id;
      console.log('[REGISTER] sponsorUser found:', sponsorUser._id, sponsorUser.name);
    } else {
      console.log('[REGISTER] No sponsorId provided, top-level user');
    }

    let referralCode;
    let codeExists = true;
    while (codeExists) {
      referralCode = generateReferralCode();
      codeExists = await User.findOne({ referralCode });
    }

    const user = new User({ name, email, password, referredBy: referredByValue, referralCode });
    console.log('[REGISTER] Creating user:', { name, email, referredBy: referredByValue, referralCode });
    await user.save();
    console.log('[REGISTER] User saved:', user._id, 'referredBy:', user.referredBy);

    res.json({
      success: true,
      message: 'Registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        boosting: user.boosting,
        referredBy: user.referredBy,
        referralCode: user.referralCode
      }
    });
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // If user doesn't have referralCode, generate and save one
    if (!user.referralCode) {
      let referralCode;
      let codeExists = true;
      while (codeExists) {
        referralCode = generateReferralCode();
        codeExists = await User.findOne({ referralCode });
      }
      user.referralCode = referralCode;
      await user.save();
    }
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        boosting: user.boosting,
        referredBy: user.referredBy,
        referralCode: user.referralCode
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Admin Login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: "Admin logged in" });
  } else {
    res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }
});

// Admin: Get All Users
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Unable to fetch users" });
  }
});

// Admin: Get Single User
app.get("/api/admin/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch user detail" });
  }
});

// Admin: Get pending deposits
app.get("/api/admin/deposits", async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' }).populate('userId', 'name email');
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching deposits' });
  }
});

// Admin: Approve deposit and distribute referral
app.post("/api/admin/approve-deposit", async (req, res) => {
  try {
    const { id } = req.body;
    const deposit = await Deposit.findById(id);
    if (!deposit || deposit.status !== 'pending') return res.status(404).json({ success: false, message: 'Invalid deposit' });

    const user = await User.findById(deposit.userId);
    user.balance += deposit.amount;
    user.wallet = (user.wallet || 0) + deposit.amount;
    user.depositedAmount = (user.depositedAmount || 0) + deposit.amount;
    deposit.status = 'approved';

    await user.save();
    await deposit.save();

    await new Transaction({ userId: user._id, amount: deposit.amount, type: "credit", description: "Deposit Approved" }).save();

    // BOOSTING LOGIC: Start/extend boosting for user
    // 1. If user has no boosting or boosting expired, start new 24h boosting
    // 2. If user has 2 direct referrals with equal/greater deposit, extend boosting to 300 days (3X)
    const now = new Date();
    let boostingChanged = false;
    if (!user.boosting || !user.boosting.isActive || (user.boosting.endTime && user.boosting.endTime < now)) {
      user.boosting = {
        isActive: true,
        startTime: now,
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        durationHours: 24,
        extendedDays: 200,
        achieved3x: false,
        directReferrals: 0,
        lastChecked: now
      };
      boostingChanged = true;
    }

    // Count direct referrals with equal/greater deposit
    const directRefs = await User.find({ referredBy: user._id });
    let qualifyingRefs = 0;
    for (const ref of directRefs) {
      if ((ref.depositedAmount || 0) >= deposit.amount) qualifyingRefs++;
    }
    if (qualifyingRefs >= 2 && user.boosting && !user.boosting.achieved3x) {
      user.boosting.extendedDays = 300;
      user.boosting.achieved3x = true;
      boostingChanged = true;
    }

    user.boosting.directReferrals = qualifyingRefs;
    user.boosting.lastChecked = now;
    if (boostingChanged) await user.save();

    // Referral income logic (3 levels, dynamic from ReferralSettings)
    const ReferralSettings = require('./models/referralSettings');
    const settings = await ReferralSettings.findOne();
    const referralPercents = [
      (settings?.level1Percent || 5) / 100,
      (settings?.level2Percent || 3) / 100,
      (settings?.level3Percent || 2) / 100
    ];
    let refUserId = user.referredBy;
    for (let i = 0; i < 3; i++) {
      if (!refUserId) break;
      const refUser = await User.findById(refUserId);
      if (!refUser) break;
      const income = deposit.amount * referralPercents[i];
      refUser.balance += income;
      await refUser.save();
      await new Transaction({
        userId: refUser._id,
        fromUser: user._id,
        toUser: refUser._id,
        amount: income,
        type: "referral_on_deposit",
        level: i + 1,
        description: `Level ${i + 1} Referral Income (Deposit)`
      }).save();
      refUserId = refUser.referredBy;
    }

    res.json({ success: true, message: 'Deposit approved and referral income processed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve deposit' });
  }
});

// --- MIGRATION: For old users, set wallet and depositedAmount = balance if wallet is missing ---
app.get('/api/admin/migrate-wallet', async (req, res) => {
  try {
    const users = await User.find();
    let updated = 0;
    for (const user of users) {
      let changed = false;
      if ((user.balance > 0) && (!user.wallet || user.wallet === 0)) {
        user.wallet = user.balance;
        changed = true;
      }
      if ((user.balance > 0) && (!user.depositedAmount || user.depositedAmount === 0)) {
        user.depositedAmount = user.balance;
        changed = true;
      }
      if (changed) {
        await user.save();
        updated++;
      }
    }
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Migration failed' });
  }
});

// Admin: Reject deposit
app.post("/api/admin/reject-deposit", async (req, res) => {
  try {
    const { id } = req.body;
    const deposit = await Deposit.findById(id);
    if (!deposit || deposit.status !== 'pending') return res.status(404).json({ success: false, message: 'Invalid deposit' });

    deposit.status = 'rejected';
    await deposit.save();

    res.json({ success: true, message: 'Deposit rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject deposit' });
  }
});

// Admin: Update User Balance
app.post('/api/admin/update-balance', async (req, res) => {
  try {
    const { userId, amount, type } = req.body;
    const user = await User.findById(userId);
    const amt = parseFloat(amount);
    if (!user || isNaN(amt)) return res.status(400).json({ success: false, message: "Invalid user or amount" });

    if (type === 'credit') {
      user.balance += amt;
    } else if (type === 'debit' && user.balance >= amt) {
      user.balance -= amt;
    } else {
      return res.status(400).json({ success: false, message: "Insufficient balance or invalid type" });
    }

    await user.save();
    await new Transaction({ userId, amount: amt, type, description: "Manual Balance Update" }).save();

    res.json({ success: true, message: "Balance updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Balance update failed" });
  }
});

// User: Submit Deposit
app.post('/api/user/deposit', async (req, res) => {
  try {
    const { email, amount, transactionId } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newDeposit = new Deposit({ userId: user._id, amount, transactionId, status: 'pending' });
    await newDeposit.save();
    res.json({ success: true, message: 'Deposit request submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Deposit error' });
  }
});

// User: Get transaction history
// Transaction history with optional type filter
app.get("/api/user/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    let query = { userId };
    if (type) query.type = type;
    const history = await Transaction.find(query).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// API: Get only trading income for user
app.get("/api/user/trading-income/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tradingHistory = await Transaction.find({ 
      userId, 
      type: 'trading_income' 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, transactions: tradingHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch trading income" });
  }
});

// ADMIN: Get all users with boosting info
app.get('/api/admin/boosting-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email boosting');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ADMIN: Toggle boosting for a user
app.post('/api/admin/boosting-toggle', async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.boosting) return res.json({ success: false });
    user.boosting.isActive = isActive;
    if (!isActive) {
      user.boosting.endTime = new Date();
    } else {
      // Reactivate for 24h from now
      const now = new Date();
      user.boosting.startTime = now;
      user.boosting.endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update boosting' });
  }
});

// ✅ CHECK 24 HOUR BOOSTING STATUS & AUTO-EXPIRE
app.get('/api/user/check-boosting/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    let boostingChanged = false;
    let message = '';

    // Check if boosting exists and is active
    if (user.boosting && user.boosting.isActive) {
      const timeLeft = user.boosting.endTime - now;
      
      // If 24 hours expired
      if (timeLeft <= 0) {
        // Count qualifying direct referrals
        const directRefs = await User.find({ referredBy: user._id });
        let qualifyingRefs = 0;
        for (const ref of directRefs) {
          if ((ref.depositedAmount || 0) >= (user.depositedAmount || 0)) qualifyingRefs++;
        }

        if (qualifyingRefs >= 2) {
          // SUCCESS: Upgrade to 3X plan (300 days)
          user.boosting.achieved3x = true;
          user.boosting.extendedDays = 300;
          user.boosting.isActive = true;
          user.boosting.endTime = new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000);
          message = '🎉 Congratulations! You are upgraded! Boosting 3X plan activated for 300 days!';
          boostingChanged = true;
        } else {
          // FAILED: Remove boosting option
          user.boosting.isActive = false;
          user.boosting.endTime = now;
          message = '⏰ 24-hour timer expired. Boosting option removed. You needed 2 direct referrals.';
          boostingChanged = true;
        }
        
        user.boosting.directReferrals = qualifyingRefs;
        user.boosting.lastChecked = now;
      } else {
        // Still within 24 hours - update referral count
        const directRefs = await User.find({ referredBy: user._id });
        let qualifyingRefs = 0;
        for (const ref of directRefs) {
          if ((ref.depositedAmount || 0) >= (user.depositedAmount || 0)) qualifyingRefs++;
        }
        user.boosting.directReferrals = qualifyingRefs;
        user.boosting.lastChecked = now;
        
        if (qualifyingRefs >= 2 && !user.boosting.achieved3x) {
          // Achieved 2 referrals within 24 hours!
          user.boosting.achieved3x = true;
          user.boosting.extendedDays = 300;
          user.boosting.endTime = new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000);
          message = '🎉 Congratulations! You are upgraded! Boosting 3X plan activated for 300 days!';
          boostingChanged = true;
        }
      }
    }

    if (boostingChanged) await user.save();

    res.json({ 
      success: true, 
      boosting: user.boosting,
      message,
      directReferrals: user.boosting?.directReferrals || 0
    });
  } catch (err) {
    console.error('Check boosting error:', err);
    res.status(500).json({ success: false, message: 'Failed to check boosting status' });
  }
});

// ✅ GET BOOSTING STATUS FOR TIMER DISPLAY
app.get('/api/user/boosting-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Auto-check boosting status
    const now = new Date();
    if (user.boosting && user.boosting.isActive) {
      const timeLeft = user.boosting.endTime - now;
      if (timeLeft <= 0 && !user.boosting.achieved3x) {
        // Auto-expire if not achieved 3x
        user.boosting.isActive = false;
        await user.save();
      }
    }

    res.json({ 
      success: true, 
      boosting: user.boosting || null,
      directReferrals: user.boosting?.directReferrals || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get boosting status' });
  }
});

// API: Get total referral income for user
app.get("/api/user/referral-income-total/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all referral income transactions
    const referralTransactions = await Transaction.find({ 
      toUser: userId, 
      type: { $in: ['referral_on_deposit', 'referral_income'] }
    });
    
    // Calculate total referral income
    const totalReferralIncome = referralTransactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);
    
    res.json({ 
      success: true, 
      totalReferralIncome: totalReferralIncome.toFixed(2),
      transactionCount: referralTransactions.length
    });
  } catch (err) {
    console.error('Referral income total error:', err);
    res.status(500).json({ success: false, message: "Failed to fetch referral income total" });
  }
});

// API: Get detailed referral income for user
app.get("/api/user/referral-income/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const referralHistory = await Transaction.find({ 
      toUser: userId, 
      type: { $in: ['referral_on_deposit', 'referral_income'] }
    }).populate('fromUser', 'name email').sort({ createdAt: -1 });
    
    // Calculate total
    const totalReferralIncome = referralHistory.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);
    
    res.json({ 
      success: true, 
      transactions: referralHistory,
      totalReferralIncome: totalReferralIncome.toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch referral income" });
  }
});

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
      }).save();
      
      console.log(`Level ${level + 1} referral income: $${income.toFixed(2)} to ${refUser.name} (from ${user.name}'s $${tradingAmount} trading income)`);
      
      // ✅ Move to next level (referrer's referrer)
      refUserId = refUser.referredBy;
    }
  } catch (error) {
    console.error('Error calculating referral income on trading:', error);
  }
}

// ✅ API: Get Reward Income Data
app.get('/api/user/reward-income', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate user's direct business amount
    const directBusiness = user.depositedAmount || 0;
    
    // Calculate reward based on direct business
    let rewardAmount = 0;
    if (directBusiness >= 2000000) rewardAmount = 25000;
    else if (directBusiness >= 500000) rewardAmount = 2000;
    else if (directBusiness >= 100000) rewardAmount = 1000;
    else if (directBusiness >= 25000) rewardAmount = 500;
    else if (directBusiness >= 10000) rewardAmount = 250;

    res.json({
      success: true,
      directBusiness,
      rewardAmount,
      totalRewardEarned: user.rewardIncome || 0
    });
  } catch (error) {
    console.error('Error fetching reward income:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reward income' });
  }
});

// ✅ API: Get Referral Income on Trading Data
app.get('/api/user/referral-trading-income', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Get all referral income transactions for this user
    const referralTransactions = await Transaction.find({
      toUser: userId,
      type: 'referral_on_trading'
    }).populate('fromUser', 'name email');

    // Group by level
    const levelIncome = {};
    let totalIncome = 0;

    referralTransactions.forEach(transaction => {
      const level = transaction.level || 1;
      if (!levelIncome[level]) {
        levelIncome[level] = {
          amount: 0,
          count: 0
        };
      }
      levelIncome[level].amount += transaction.amount;
      levelIncome[level].count += 1;
      totalIncome += transaction.amount;
    });

    res.json({
      success: true,
      levelIncome,
      totalIncome,
      transactions: referralTransactions
    });
  } catch (error) {
    console.error('Error fetching referral trading income:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referral trading income' });
  }
});

// ✅ Admin: Clean up wrong referral income transactions
app.post('/api/admin/cleanup-referral-transactions', async (req, res) => {
  try {
    // Remove referral_on_trading transactions where fromUser = toUser (wrong logic)
    const wrongTransactions = await Transaction.find({
      type: 'referral_on_trading',
      $expr: { $eq: ['$fromUser', '$toUser'] }
    });

    console.log(`Found ${wrongTransactions.length} wrong referral transactions`);

    // Reverse the wrong transactions
    for (const transaction of wrongTransactions) {
      const user = await User.findById(transaction.userId);
      if (user) {
        // Subtract the wrong amount
        user.balance -= transaction.amount;
        user.referralIncome = (user.referralIncome || 0) - transaction.amount;
        if (user.balance < 0) user.balance = 0;
        if (user.referralIncome < 0) user.referralIncome = 0;
        await user.save();
        
        console.log(`Reversed $${transaction.amount} from ${user.name}`);
      }
    }

    // Delete the wrong transactions
    await Transaction.deleteMany({
      type: 'referral_on_trading',
      $expr: { $eq: ['$fromUser', '$toUser'] }
    });

    res.json({ 
      success: true, 
      message: `Cleaned up ${wrongTransactions.length} wrong referral transactions`,
      cleanedCount: wrongTransactions.length
    });
  } catch (error) {
    console.error('Error cleaning up transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to cleanup transactions' });
  }
});

// ✅ DEBUG: Test Referral Income Calculation
app.post('/api/debug/test-referral-income', async (req, res) => {
  try {
    const { userId, tradingAmount } = req.body;
    
    console.log(`Testing referral income for userId: ${userId}, amount: ${tradingAmount}`);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    console.log(`User: ${user.name}, referredBy: ${user.referredBy}`);
    
    const referralLevels = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02];
    let refUserId = user.referredBy;
    const results = [];
    
    for (let level = 0; level < 10; level++) {
      if (!refUserId) {
        results.push({ level: level + 1, status: 'No referrer found' });
        break;
      }
      
      const refUser = await User.findById(refUserId);
      if (!refUser) {
        results.push({ level: level + 1, status: 'Invalid referrer' });
        break;
      }
      
      const income = tradingAmount * referralLevels[level];
      
      results.push({
        level: level + 1,
        referrerName: refUser.name,
        referrerId: refUser._id,
        income: income,
        percentage: (referralLevels[level] * 100).toFixed(0) + '%'
      });
      
      console.log(`Level ${level + 1}: ${refUser.name} should get $${income.toFixed(2)}`);
      
      refUserId = refUser.referredBy;
    }
    
    res.json({
      success: true,
      userName: user.name,
      tradingAmount,
      referralChain: results
    });
    
  } catch (error) {
    console.error('Debug referral error:', error);
    res.status(500).json({ success: false, message: 'Debug failed', error: error.message });
  }
});

// ✅ Manual Test: Force Run Trading Income Job for One User
app.post('/api/admin/force-trading-income', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find user's active deposits
    const Deposit = require('./models/deposit');
    const deposits = await Deposit.find({ userId: userId, status: 'approved', isActive: true });
    
    if (deposits.length === 0) {
      return res.json({ success: false, message: 'No active deposits found for this user' });
    }

    const results = [];
    
    for (const deposit of deposits) {
      // Calculate 1% ROI
      const roi = deposit.amount * 0.01;
      
      // Check if deposit is still eligible
      if (deposit.totalPaid >= deposit.amount * 2) {
        deposit.isActive = false;
        await deposit.save();
        continue;
      }

      // Cap ROI if needed
      let finalRoi = roi;
      if (deposit.totalPaid + roi > deposit.amount * 2) {
        finalRoi = deposit.amount * 2 - deposit.totalPaid;
      }

      if (finalRoi > 0) {
        // Add trading income to user
        user.balance += finalRoi;
        user.wallet += finalRoi;
        await user.save();

        deposit.totalPaid += finalRoi;
        if (deposit.totalPaid >= deposit.amount * 2) deposit.isActive = false;
        await deposit.save();

        // Create trading income transaction
        await new Transaction({
          userId: user._id,
          amount: finalRoi,
          type: 'trading_income',
          description: `Manual Trading Income (1% on $${deposit.amount} deposit)`
        }).save();

        // ✅ INLINE Referral Income Calculation
        const referralLevels = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02];
        let refUserId = user.referredBy;
        const referralResults = [];
        
        for (let level = 0; level < 10; level++) {
          if (!refUserId) break;
          
          const refUser = await User.findById(refUserId);
          if (!refUser) break;
          
          const income = finalRoi * referralLevels[level];
          
          // Add to referrer's balance
          refUser.balance += income;
          refUser.referralIncome = (refUser.referralIncome || 0) + income;
          await refUser.save();
          
          // Create transaction
          await new Transaction({
            userId: refUser._id,
            fromUser: user._id,
            toUser: refUser._id,
            amount: income,
            type: "referral_on_trading",
            level: level + 1,
            description: `Level ${level + 1} Referral Income on Trading (${(referralLevels[level] * 100).toFixed(0)}%) - Manual`
          }).save();
          
          referralResults.push({
            level: level + 1,
            referrerName: refUser.name,
            amount: income,
            percentage: (referralLevels[level] * 100).toFixed(0) + '%'
          });
          
          console.log(`✅ Manual Level ${level + 1}: $${income.toFixed(2)} to ${refUser.name}`);
          
          refUserId = refUser.referredBy;
        }

        results.push({
          depositAmount: deposit.amount,
          tradingIncome: finalRoi,
          referralDistributed: referralResults
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Manual trading income processed',
      userName: user.name,
      results
    });
    
  } catch (error) {
    console.error('Force trading income error:', error);
    res.status(500).json({ success: false, message: 'Failed to process trading income' });
  }
});

// ✅ Complete Test API: Check User's Referral Chain & Test Distribution
app.post('/api/admin/test-referral-chain', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check referral chain
    const chain = [];
    let currentRefId = user.referredBy;
    
    for (let level = 1; level <= 10; level++) {
      if (!currentRefId) break;
      
      const refUser = await User.findById(currentRefId);
      if (!refUser) break;
      
      chain.push({
        level,
        id: refUser._id,
        name: refUser.name,
        email: refUser.email,
        currentBalance: refUser.balance || 0,
        referralIncome: refUser.referralIncome || 0
      });
      
      currentRefId = refUser.referredBy;
    }

    // Check recent trading income transactions
    const recentTrading = await Transaction.find({
      userId: userId,
      type: 'trading_income'
    }).sort({ createdAt: -1 }).limit(5);

    // Check recent referral transactions
    const recentReferral = await Transaction.find({
      type: 'referral_on_trading',
      fromUser: userId
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      userName: user.name,
      userBalance: user.balance || 0,
      hasReferredBy: !!user.referredBy,
      referralChain: chain,
      recentTradingIncome: recentTrading,
      recentReferralDistributions: recentReferral
    });
    
  } catch (error) {
    console.error('Test referral chain error:', error);
    res.status(500).json({ success: false, message: 'Failed to test referral chain' });
  }
});

// ✅ Simple Test: Trigger Small Amount to Test Distribution
app.post('/api/admin/test-small-referral', async (req, res) => {
  try {
    const { userId } = req.body;
    const testAmount = 1; // $1 for testing
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add test trading income first
    user.balance += testAmount;
    user.wallet += testAmount;
    await user.save();

    await new Transaction({
      userId: user._id,
      amount: testAmount,
      type: 'trading_income',
      description: 'Test Trading Income for Referral Check'
    }).save();

    // Now distribute referral income
    const referralLevels = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02];
    let refUserId = user.referredBy;
    const distributed = [];
    
    for (let level = 0; level < 10; level++) {
      if (!refUserId) break;
      
      const refUser = await User.findById(refUserId);
      if (!refUser) break;
      
      const income = testAmount * referralLevels[level];
      
      refUser.balance += income;
      refUser.referralIncome = (refUser.referralIncome || 0) + income;
      await refUser.save();
      
      await new Transaction({
        userId: refUser._id,
        fromUser: user._id,
        toUser: refUser._id,
        amount: income,
        type: "referral_on_trading",
        level: level + 1,
        description: `Test Level ${level + 1} Referral Income (${(referralLevels[level] * 100).toFixed(0)}%)`
      }).save();
      
      distributed.push({
        level: level + 1,
        referrerName: refUser.name,
        amount: income,
        percentage: (referralLevels[level] * 100).toFixed(0) + '%'
      });
      
      refUserId = refUser.referredBy;
    }

    res.json({
      success: true,
      message: `Test completed for ${user.name}`,
      testAmount,
      distributed
    });
    
  } catch (error) {
    console.error('Small referral test error:', error);
    res.status(500).json({ success: false, message: 'Failed to test small referral' });
  }
});

// User Withdrawal OTP API
const userWithdrawalOtpRouter = require('./routes/userWithdrawalOtp');
app.use('/api/user/withdrawal-otp', userWithdrawalOtpRouter);

// Serve React frontend (production build)
const clientBuildPath = path.join(__dirname, 'client', 'build');
// Always enable SPA fallback so refresh/direct route never gives Not Found
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
