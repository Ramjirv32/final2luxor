const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/mongo-status', async (req, res) => {
  try {
    // Check MongoDB connection state
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    // Get connection stats if connected
    let stats = null;
    if (state === 1) {
      stats = await mongoose.connection.db.admin().serverStatus();
    }
    
    res.json({
      isConnected: state === 1,
      state: stateMap[state] || 'unknown',
      stats: stats ? {
        version: stats.version,
        uptime: stats.uptime,
        connections: stats.connections,
      } : null,
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (err) {
    console.error('Error checking MongoDB status:', err);
    res.status(500).json({
      error: 'Failed to check database status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
