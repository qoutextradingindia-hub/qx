const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  transactionId: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  totalPaid: { type: Number, default: 0 }, // Total ROI paid on this deposit
  isActive: { type: Boolean, default: true }, // Plan active for ROI or not
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
