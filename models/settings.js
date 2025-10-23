const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  roiPercentage: { type: Number, default: 1 }, // %
  roiDuration: { type: Number, default: 1 }, // duration value
  roiDurationUnit: { type: String, default: 'days' }, // 'minutes', 'hours', 'days'
  roiFrequency: { type: String, default: '0 0 * * *' }, // cron string, default: daily at midnight
  depositAddress: { type: String, default: '' }, // Admin set deposit address
  depositQrCode: { type: String, default: '' }, // Admin set QR code (image url or base64)
  buyQrCode: { type: String, default: '' }, // Admin set Buy QR code (image url or base64)
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
