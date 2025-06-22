const Booking = require('../models/Booking');
const Villa = require('../models/Villa');
const nodemailer = require('nodemailer');

exports.createBooking = async (req, res) => {
  try {
    console.log("[BOOKING] Received booking request:", req.body);

    const { villaId, email, guestName, checkIn, checkOut, guests } = req.body;
    if (!villaId || !email || !checkIn || !checkOut || !guests) {
      console.error("[BOOKING] Missing required fields", req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log("[BOOKING] Looking for villa with id:", villaId);
    const villa = await Villa.findById(villaId);
    if (!villa) {
      console.error("[BOOKING] Villa not found for id:", villaId);
      return res.status(404).json({ error: 'Villa not found' });
    }

    console.log("[BOOKING] Creating booking for villa:", villa.name);
    const booking = await Booking.create({
      villaId,
      villaName: villa.name,
      email,
      guestName,
      checkIn,
      checkOut,
      guests
    });

    console.log("[BOOKING] Booking created:", booking);

    // Send confirmation email
    try {
      await sendBookingEmail(email, villa.name, checkIn, checkOut, guests);
      console.log("[BOOKING] Confirmation email sent to:", email);
    } catch (mailErr) {
      console.error("[BOOKING] Error sending confirmation email:", mailErr);
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("[BOOKING] Error in createBooking:", err);
    res.status(500).json({ error: err.message });
  }
};

async function sendBookingEmail(email, villaName, checkIn, checkOut, guests) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.gmail,
      pass: process.env.pass
    }
  });

  const mailOptions = {
    from: process.env.gmail,
    to: email,
    subject: `Booking Confirmation for ${villaName}`,
    html: `
      <h2>Thank you for your booking!</h2>
      <p>Your booking for <strong>${villaName}</strong> is confirmed.</p>
      <ul>
        <li>Check-in: ${new Date(checkIn).toLocaleDateString()}</li>
        <li>Check-out: ${new Date(checkOut).toLocaleDateString()}</li>
        <li>Guests: ${guests}</li>
      </ul>
      <p>We look forward to hosting you!</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Search bookings that overlap with a date range
exports.searchBookings = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut required" });
    }
    // Find bookings that overlap with the requested range
    const bookings = await Booking.find({
      $or: [
        {
          checkIn: { $lte: new Date(checkOut) },
          checkOut: { $gte: new Date(checkIn) }
        }
      ]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
