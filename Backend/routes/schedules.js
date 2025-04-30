const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const { auth, adminAuth } = require('../middlewares/auth');

// Get all schedules
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('routeId')
      .populate('busId')
      .populate('driverId', '-password');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single schedule
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('routeId')
      .populate('busId')
      .populate('driverId', '-password');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new schedule (admin only)
router.post('/', [
  adminAuth,
  body('routeId').isMongoId(),
  body('busId').isMongoId(),
  body('driverId').isMongoId(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schedule = new Schedule(req.body);
    await schedule.save();
    
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('routeId')
      .populate('busId')
      .populate('driverId', '-password');
    
    res.status(201).json(populatedSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a schedule (admin only)
router.put('/:id', [
  adminAuth,
  body('routeId').optional().isMongoId(),
  body('busId').optional().isMongoId(),
  body('driverId').optional().isMongoId(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('routeId')
    .populate('busId')
    .populate('driverId', '-password');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a schedule (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedules for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedules = await Schedule.find({
      startTime: {
        $gte: date,
        $lt: nextDay
      }
    })
    .populate('routeId')
    .populate('busId')
    .populate('driverId', '-password');

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update schedule status
router.patch('/:id/status', [
  auth,
  body('status').isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
  body('actualStartTime').optional().isISO8601(),
  body('actualEndTime').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('routeId')
    .populate('busId')
    .populate('driverId', '-password');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 