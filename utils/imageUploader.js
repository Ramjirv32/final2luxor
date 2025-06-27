const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Villa = require('../models/Villa');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Uploads images for a specific villa
 * @param {string} villaName - The name of the villa to update
 * @param {string} folderName - The folder containing images (default: same as villaName with spaces removed)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result object with success status and details
 */
async function uploadVillaImages(villaName, folderName = null, options = {}) {
  const folderPath = folderName || villaName.replace(/\s+/g, '');
  const imageDirectory = path.join(__dirname, '..', 'villas', folderPath);
  
  try {
    // Validate inputs
    if (!villaName) {
      return { success: false, error: 'Villa name is required' };
    }
    
    // Check if folder exists
    if (!fs.existsSync(imageDirectory)) {
      return { 
        success: false, 
        error: `Image directory not found: ${imageDirectory}`,
        details: `Please create the directory and add images before running this function.`
      };
    }
    
    // Find villa in database
    const villa = await Villa.findOne({ name: { $regex: new RegExp(villaName, 'i') } });
    
    if (!villa) {
      return { success: false, error: `Villa "${villaName}" not found in database` };
    }
    
    // Get image files from directory
    const imageFiles = fs.readdirSync(imageDirectory).filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      return { success: false, error: `No image files found in ${imageDirectory}` };
    }
    
    // Create image references - for actual implementation, upload to cloud storage
    const imageUrls = imageFiles.map(file => `villas/${folderPath}/${file}`);
    
    // Update villa in database
    villa.images = imageUrls;
    await villa.save();
    
    return {
      success: true,
      message: `Updated ${villa.name} with ${imageUrls.length} images`,
      villa: {
        id: villa._id,
        name: villa.name,
        images: imageUrls
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

module.exports = {
  uploadVillaImages
};
