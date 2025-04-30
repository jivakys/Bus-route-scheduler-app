const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Route = require('../models/Route');
const { auth, adminAuth } = require('../middlewares/auth');

// Get all routes
router.get('/', auth, async (req, res) => {
  try {
    const routes = await Route.find().populate('stops.stopId');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single route
router.get('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('stops.stopId');
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new route (admin only)
router.post('/', [
  adminAuth,
  body('name').trim().isLength({ min: 3 }),
  body('description').optional().trim(),
  body('stops').isArray(),
  body('totalDistance').isNumeric(),
  body('estimatedDuration').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a route (admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim(),
  body('stops').optional().isArray(),
  body('totalDistance').optional().isNumeric(),
  body('estimatedDuration').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a route (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active routes
router.get('/active/routes', auth, async (req, res) => {
  try {
    const routes = await Route.find({ active: true }).populate('stops.stopId');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 