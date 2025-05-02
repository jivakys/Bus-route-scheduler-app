const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startPoint: {
    type: String,
    required: true,
    trim: true
  },
  endPoint: {
    type: String,
    required: true,
    trim: true
  },
  stops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  }],
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema); 