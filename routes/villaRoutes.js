const express = require('express');
const router = express.Router();
const villaController = require('../controllers/villaController');

router.post('/add', villaController.addVillas); // Add one or many villas
router.get('/', villaController.getAllVillas); // Get all villas
router.get('/search', villaController.searchVillas); // Search/filter villas

module.exports = router;
