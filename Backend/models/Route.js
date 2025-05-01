const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    stops: [
      {
        stopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stop",
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        arrivalTime: {
          type: String,
          required: true,
        },
        departureTime: {
          type: String,
          required: true,
        },
      },
    ],
    totalDistance: {
      type: Number,
      required: true,
    },
    estimatedDuration: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Update the updatedAt field before saving
routeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Route", routeSchema);
