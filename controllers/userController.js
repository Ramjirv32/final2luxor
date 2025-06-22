const User = require('../models/User');

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
