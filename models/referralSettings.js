const mongoose = require('mongoose');

const referralSettingsSchema = new mongoose.Schema({
  level1Percent: { type: Number, default: 5 }, // %
  level2Percent: { type: Number, default: 3 },
  level3Percent: { type: Number, default: 2 },
  boostingTime: { type: Number, default: 24 }, // hours
  minDirectReferrals: { type: Number, default: 2 },
  boostingStatus: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ReferralSettings', referralSettingsSchema);
