// Transaction model for tradingIncomeJob.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: String,
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
