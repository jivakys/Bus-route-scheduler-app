const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const { auth, adminAuth } = require('../middlewares/auth');

// Get all buses
router.get('/', auth, async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single bus
router.get('/:id', auth, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new bus (admin only)
router.post('/', [
  adminAuth,
  body('busNumber').trim().isLength({ min: 3 }),
  body('capacity').isInt({ min: 1 }),
  body('type').isIn(['standard', 'articulated', 'double_decker']),
  body('features').optional().isArray(),
  body('status').optional().isIn(['active', 'maintenance', 'retired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a bus (admin only)
router.put('/:id', [
  adminAuth,
  body('busNumber').optional().trim().isLength({ min: 3 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('type').optional().isIn(['standard', 'articulated', 'double_decker']),
  body('features').optional().isArray(),
  body('status').optional().isIn(['active', 'maintenance', 'retired']),
  body('lastMaintenanceDate').optional().isISO8601(),
  body('nextMaintenanceDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a bus (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bus location
router.patch('/:id/location', [
  auth,
  body('currentLocation.type').equals('Point'),
  body('currentLocation.coordinates').isArray().isLength(2)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { currentLocation: req.body.currentLocation },
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active buses
router.get('/active/buses', auth, async (req, res) => {
  try {
    const buses = await Bus.find({ status: 'active' });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get buses in maintenance
router.get('/maintenance/buses', auth, async (req, res) => {
  try {
    const buses = await Bus.find({ status: 'maintenance' });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 