const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Stop = require('../models/Stop');
const { auth, adminAuth } = require('../middlewares/auth');

// Get all stops
router.get('/', auth, async (req, res) => {
  try {
    const stops = await Stop.find();
    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single stop
router.get('/:id', auth, async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    res.json(stop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new stop (admin only)
router.post('/', [
  adminAuth,
  body('name').trim().isLength({ min: 3 }),
  body('location.type').equals('Point'),
  body('location.coordinates').isArray().isLength(2),
  body('address').optional().isObject(),
  body('facilities').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const stop = new Stop(req.body);
    await stop.save();
    res.status(201).json(stop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a stop (admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 3 }),
  body('location.type').optional().equals('Point'),
  body('location.coordinates').optional().isArray().isLength(2),
  body('address').optional().isObject(),
  body('facilities').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    res.json(stop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a stop (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Find stops near a location
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const stops = await Stop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 