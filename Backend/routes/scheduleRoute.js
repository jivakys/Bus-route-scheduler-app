const express = require('express');
const router = express.Router();
const ScheduleModel = require('../models/ScheduleModel');
const { auth } = require('../middlewares/auth');

// Get all schedules
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await ScheduleModel.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single schedule
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await ScheduleModel.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new schedule
router.post('/', auth, async (req, res) => {
  try {
    const schedule = new ScheduleModel(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a schedule
router.put('/:id', auth, async (req, res) => {
  try {
    const schedule = await ScheduleModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a schedule
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await ScheduleModel.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 