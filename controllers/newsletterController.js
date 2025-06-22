const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(now.getFullYear() + 1);

    let subscription = await Newsletter.findOne({ email });
    if (subscription) {
      // Update expiry if already subscribed
      subscription.expiresAt = expiresAt;
      await subscription.save();
      return res.json({ message: 'Subscription renewed for 1 year', subscription });
    } else {
      subscription = await Newsletter.create({ email, expiresAt });
      return res.json({ message: 'Subscribed successfully for 1 year', subscription });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
