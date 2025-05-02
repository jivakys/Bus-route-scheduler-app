const express = require('express');
const router = express.Router();
const RouteModel = require('../models/RouteModel');
const { auth } = require('../middlewares/auth');

// Get all routes
router.get('/', auth, async (req, res) => {
  try {
    const routes = await RouteModel.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single route
router.get('/:id', auth, async (req, res) => {
  try {
    const route = await RouteModel.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new route
router.post('/', auth, async (req, res) => {
  try {
    const route = new RouteModel(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a route
router.put('/:id', auth, async (req, res) => {
  try {
    const route = await RouteModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a route
router.delete('/:id', auth, async (req, res) => {
  try {
    const route = await RouteModel.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 