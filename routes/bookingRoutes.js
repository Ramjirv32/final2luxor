const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/create', bookingController.createBooking);
router.get('/search', bookingController.searchBookings);
router.get('/', bookingController.getBookingsByUser); // Get bookings by user
router.get('/:id', bookingController.getBookingById); // Get booking by ID

module.exports = router;
