const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(now.getFullYear() + 1);

    let subscription = await Newsletter.findOne({ email });
    let isNew = false;
    if (subscription) {
      // Update expiry if already subscribed
      subscription.expiresAt = expiresAt;
      await subscription.save();
    } else {
      subscription = await Newsletter.create({ email, expiresAt });
      isNew = true;
    }

    // Send confirmation email to the user
    try {
      await sendNewsletterEmail(email, isNew);
    } catch (mailErr) {
      // Log but do not fail the API if email sending fails
      console.error("[NEWSLETTER] Error sending confirmation email:", mailErr);
    }

    return res.json({
      success: true,
      message: isNew
        ? 'Subscribed successfully for 1 year'
        : 'Subscription renewed for 1 year',
      subscription
    });
  } catch (err) {
    console.error("[NEWSLETTER] Error in subscribe method:", err);
    res.status(500).json({ 
      success: false,
      error: 'Server error while processing subscription',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper to send newsletter confirmation email
async function sendNewsletterEmail(email, isNew) {
  // Use environment variables for credentials
  if (!process.env.gmail || !process.env.pass) {
    console.error("[NEWSLETTER] Missing email credentials in environment variables");
    throw new Error("Email configuration missing");
  }
  
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
    subject: isNew
      ? 'Welcome to the Luxor Newsletter!'
      : 'Your Luxor Newsletter Subscription is Renewed',
    html: `
      <h2>Thank you for subscribing to Luxor!</h2>
      <p>
        ${isNew
          ? 'You have been successfully subscribed to our newsletter. You will now receive exclusive offers, travel inspiration, and updates from Luxor.'
          : 'Your newsletter subscription has been renewed for another year. Stay tuned for more updates and offers from Luxor.'}
      </p>
      <p>If you did not request this subscription, please ignore this email.</p>
      <p>Best regards,<br/>Luxor Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[NEWSLETTER] Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[NEWSLETTER] Error sending email to ${email}:`, error);
    throw error; // Re-throw for proper error handling
  }
}
