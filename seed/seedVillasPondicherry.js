const mongoose = require('mongoose');
const Villa = require('../models/Villa');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luxor';

const villas = [
  {
    name: "Serenity Beach Villa",
    location: "Pondicherry, India",
    price: 12000,
    description: "A tranquil villa just steps from Serenity Beach, perfect for families and couples.",
    images: ["empireAnandVillaImages"],
    facilities: [
      { name: "Private Pool", image: "Pool" },
      { name: "Free Parking", image: "Parking" },
      { name: "AC", image: "Ac" },
      { name: "WiFi", image: "Wifi" },
      { name: "Kitchen", image: "Kitchen" }
    ],
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
  },
  {
    name: "White Town Heritage Villa",
    location: "Pondicherry, India",
    price: 15500,
    description: "Colonial-style villa in the heart of White Town, walkable to cafes and the promenade.",
    images: ["empireAnandVillaImages"],
    facilities: [
      { name: "Private Pool", image: "Pool" },
      { name: "Free Parking", image: "Parking" },
      { name: "AC", image: "Ac" },
      { name: "WiFi", image: "Wifi" },
      { name: "Kitchen", image: "Kitchen" }
    ],
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
  },
  {
    name: "Bay View Villa",
    location: "Chennai, India",
    price: 18000,
    description: "Luxury villa with panoramic bay views, private pool, and modern amenities.",
    images: ["empireAnandVillaImages"],
    facilities: [
      { name: "Private Pool", image: "Pool" },
      { name: "Free Parking", image: "Parking" },
      { name: "AC", image: "Ac" },
      { name: "WiFi", image: "Wifi" },
      { name: "Kitchen", image: "Kitchen" }
    ],
    guests: 10,
    bedrooms: 5,
    bathrooms: 5,
  }
];

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Villa.insertMany(villas);
    console.log('Seeded Pondicherry and Chennai villas!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Seed error:', err);
    mongoose.disconnect();
  });
