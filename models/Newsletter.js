const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { collection: 'Newsletter' });

module.exports = mongoose.model('Newsletter', newsletterSchema);
