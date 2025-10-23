const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // For referral income
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // For referral income
  amount: Number,
  type: String, // e.g. trading_income, referral_on_deposit, referral_on_trading
  level: { type: Number, default: null }, // 1,2,3 for referral
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
