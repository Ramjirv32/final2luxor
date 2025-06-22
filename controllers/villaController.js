const Villa = require('../models/Villa');

// Add one or many villas
exports.addVillas = async (req, res) => {
  try {
    const villas = Array.isArray(req.body) ? req.body : [req.body];
    const result = await Villa.insertMany(villas);
    res.json({ success: true, villas: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all villas
exports.getAllVillas = async (req, res) => {
  try {
    const villas = await Villa.find();
    res.json(villas); // Send just the villas array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filter/search villas
exports.searchVillas = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice } = req.query;
    let filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) {
      // Partial match (case-insensitive) for location
      filter.location = { $regex: location, $options: 'i' };
    }
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    const villas = await Villa.find(filter);
    res.json(villas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

