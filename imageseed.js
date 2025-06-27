const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Villa model with proper path
const Villa = require('./models/Villa');

// MongoDB connection string - from env or hardcoded fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Luxor:Luxor2025.@cluster0.yvt63mc.mongodb.net/LuxorFinal?retryWrites=true&w=majority';

// Target villa name from command line arguments or default to "Empire Anand Villa Samudra"
const targetVillaName = process.argv[2] || "Empire Anand Villa Samudra";
const folderName = process.argv[3] || targetVillaName.replace(/\s+/g, '').toLowerCase();

// Additional villas to ensure they exist in the database
const additionalVillas = [
  {
    name: "East Coast Villa",
    location: "Chennai, Tamil Nadu",
    price: 22500,
    description: "Experience luxury living at East Coast Villa, a beautiful beachside retreat in Chennai with panoramic ocean views and premium amenities.",
    facilities: [
      { name: "Private Pool", image: "Pool" },
      { name: "Free Parking", image: "Parking" },
      { name: "AC", image: "Ac" },
      { name: "WiFi", image: "Wifi" },
      { name: "Kitchen", image: "Kitchen" }
    ],
    guests: 10,
    bedrooms: 5,
    bathrooms: 5
  },
  {
    name: "Ram Water Villa",
    location: "Pondicherry, India",
    price: 18900,
    description: "Enjoy a serene stay at Ram Water Villa in Pondicherry, featuring a private waterfront location with stunning lagoon views and modern luxuries.",
    facilities: [
      { name: "Private Pool", image: "Pool" },
      { name: "Free Parking", image: "Parking" },
      { name: "AC", image: "Ac" },
      { name: "WiFi", image: "Wifi" },
      { name: "Kitchen", image: "Kitchen" }
    ],
    guests: 8,
    bedrooms: 4,
    bathrooms: 4
  }
];

/**
 * Function to convert image to base64
 * @param {string} filePath - Path to the image file
 * @returns {string} - Base64 encoded image with mime type prefix
 */
function imageToBase64(filePath) {
  const image = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = extension === '.png' ? 'image/png' : 
                   extension === '.gif' ? 'image/gif' : 'image/jpeg';
  return `data:${mimeType};base64,${image.toString('base64')}`;
}

/**
 * Function to create directory if it doesn't exist
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Function to find or create a villa
 * @param {string} villaName - Name of the villa to find or create
 * @param {Object} defaultData - Default data for creating the villa
 */
async function findOrCreateVilla(villaName, defaultData = null) {
  let villa = await Villa.findOne({ 
    name: { $regex: new RegExp(villaName, 'i') } 
  });
  
  if (!villa) {
    console.log(`❗ Villa "${villaName}" not found in database.`);
    
    if (defaultData) {
      console.log(`🏡 Creating new villa entry for "${villaName}"...`);
      villa = new Villa(defaultData);
      await villa.save();
      console.log(`✅ Created new villa: ${villaName} (ID: ${villa._id})`);
    } else {
      // Use generic data
      console.log(`🏡 Creating new villa entry with generic data for "${villaName}"...`);
      villa = new Villa({
        name: villaName,
        location: "Pondicherry, India",
        price: 18500,
        description: `Experience luxury and comfort at ${villaName}, a beautiful retreat in Pondicherry with stunning views and premium amenities.`,
        images: [],
        facilities: [
          { name: "Private Pool", image: "Pool" },
          { name: "Free Parking", image: "Parking" },
          { name: "AC", image: "Ac" },
          { name: "WiFi", image: "Wifi" },
          { name: "Kitchen", image: "Kitchen" }
        ],
        guests: 8,
        bedrooms: 4,
        bathrooms: 4
      });
      await villa.save();
      console.log(`✅ Created new villa: ${villaName} (ID: ${villa._id})`);
    }
  } else {
    console.log(`✅ Found villa: ${villa.name} (ID: ${villa._id})`);
  }
  
  return villa;
}

/**
 * Ensure all additional villas exist in the database
 */
async function ensureAdditionalVillasExist() {
  for (const villaData of additionalVillas) {
    await findOrCreateVilla(villaData.name, villaData);
  }
}

/**
 * Main function to process and upload villa images as base64
 */
async function uploadVillaImages() {
  let connection = null;
  
  try {
    console.log(`🔄 Connecting to MongoDB...`);
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // First ensure all additional villas exist
    await ensureAdditionalVillasExist();

    // Now handle the target villa
    let villa = await findOrCreateVilla(targetVillaName);
    
    // Create the villa directory structure
    const baseDir = path.join(__dirname, 'villa');
    ensureDirectoryExists(baseDir);
    
    const villaDir = path.join(baseDir, folderName);
    const createdDir = ensureDirectoryExists(villaDir);
    
    if (createdDir) {
      console.log(`💡 Please put your images in this directory and run the script again.`);
      console.log(`📂 Directory path: ${villaDir}`);
      return;
    }
    
    // Read images from folder
    const imageFiles = fs.readdirSync(villaDir).filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png') ||
      file.toLowerCase().endsWith('.gif')
    );

    if (imageFiles.length === 0) {
      console.log(`❌ No image files found in ${villaDir}`);
      console.log(`💡 Please add some image files (JPG, PNG, GIF) to the directory.`);
      return;
    }

    console.log(`🖼️ Found ${imageFiles.length} images in folder: ${villaDir}`);
    console.log(`🔄 Converting images to base64...`);

    // Convert images to base64
    const base64Images = imageFiles.map(file => {
      const filePath = path.join(villaDir, file);
      console.log(`   Converting: ${file}`);
      return imageToBase64(filePath);
    });

    console.log(`✅ Successfully converted ${base64Images.length} images to base64`);

    // Update villa with base64 images
    villa.images = base64Images;
    await villa.save();
    
    console.log(`✅ Successfully updated ${villa.name} with ${base64Images.length} base64 images`);
    console.log(`⚠️ Note: Base64 images are much larger than URLs. Your database size will increase significantly.`);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('📴 Disconnected from MongoDB');
    }
  }
}

// Run the main function
uploadVillaImages().then(() => {
  console.log('🏁 Script execution completed');
});
