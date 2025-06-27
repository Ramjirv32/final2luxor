const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      user: { 
        id: user._id,
        name: user.name,
        email: user.email 
      }, 
      token 
    });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password (assuming you have a proper password validation in your User model)
    const isMatch = password === user.password; // Replace with proper password comparison
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ 
      user: { 
        id: user._id,
        name: user.name,
        email: user.email 
      }, 
      token 
    });
  } catch (err) {
    console.error('Error in loginUser:', err);
    res.status(500).json({ error: err.message });
  }
};

// Sync user from Clerk
exports.syncClerkUser = async (req, res) => {
  try {
    const { clerkId, email, name, imageUrl } = req.body;
    
    // Find existing user or create new one
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.clerkId = clerkId || user.clerkId;
      user.imageUrl = imageUrl || user.imageUrl;
      await user.save();
    } else {
      // Create new user
      user = new User({
        email,
        name,
        clerkId,
        imageUrl,
        password: Math.random().toString(36).slice(-8) // Generate random password
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ 
      user: { 
        id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl
      }, 
      token 
    });
  } catch (err) {
    console.error('Error in syncClerkUser:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.name = name || user.name;
    user.email = email || user.email;
    user.imageUrl = imageUrl || user.imageUrl;
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl
    });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ error: err.message });
  }
};

// Sync user from frontend (Clerk)
exports.syncUser = async (req, res) => {
  try {
    console.log("[BACKEND] /api/users/sync called. Body received:", req.body);
    const { clerkId, email, name, imageUrl } = req.body;
    if (!clerkId || !email) {
      console.error("[BACKEND] Missing required fields", req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let user = await User.findOne({ clerkId });
    if (!user) {
      console.log("[BACKEND] No user found, creating new user...");
      user = await User.create({ clerkId, email, password: clerkId, name, imageUrl });
      console.log("[BACKEND] User created:", user);
    } else {
      console.log("[BACKEND] User found, updating...");
      user.email = email;
      user.password = clerkId;
      user.name = name;
      user.imageUrl = imageUrl;
      await user.save();
      console.log("[BACKEND] User updated:", user);
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("[BACKEND] Error in syncUser:", err);
    res.status(500).json({ error: err.message });
  }
};
