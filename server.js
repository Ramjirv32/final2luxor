const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const userRoutes = require('./routes/userRoutes');
const villaRoutes = require('./routes/villaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const photoGalleryRoutes = require('./routes/photoGalleryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// Initialize Express app
const app = express();

// Configure CORS - more permissive for debugging
app.use(cors({
  origin: ['http://localhost:5173', 'https://luxor-stay.vercel.app', 'https://luxor-q-luxor-stay.vercel.app'],
  credentials: true,
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// MongoDB connection with error handling
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxor';
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/villas', villaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', photoGalleryRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Main route 
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Luxor API' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Connect to MongoDB before starting the server
connectDB().then((connected) => {
  if (connected) {
    const PORT = process.env.PORT || 5000;
    
    // For local development
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  }
});

// Export for serverless environment
module.exports = app;