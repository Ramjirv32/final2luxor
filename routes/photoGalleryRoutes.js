const express = require('express');
const router = express.Router();
const photoGalleryController = require('../controllers/photoGalleryController');

router.post('/save', photoGalleryController.saveGallery);
router.get('/:villaId', photoGalleryController.getGallery);

module.exports = router;
