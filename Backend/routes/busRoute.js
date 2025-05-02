const express = require('express');
const router = express.Router();
const BusModel = require('../models/BusModel');
const { auth } = require('../middlewares/auth');

// Get all buses
router.get('/', auth, async (req, res) => {
  try {
    const buses = await BusModel.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single bus
router.get('/:id', auth, async (req, res) => {
  try {
    const bus = await BusModel.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new bus
router.post('/', auth, async (req, res) => {
  try {
    const bus = new BusModel(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a bus
router.put('/:id', auth, async (req, res) => {
  try {
    const bus = await BusModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a bus
router.delete('/:id', auth, async (req, res) => {
  try {
    const bus = await BusModel.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 