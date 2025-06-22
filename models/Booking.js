const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: true },
  villaName: { type: String, required: true },
  email: { type: String, required: true },
  guestName: { type: String },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
