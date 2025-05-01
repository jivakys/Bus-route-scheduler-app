const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["standard", "articulated", "double_decker"],
      default: "standard",
    },
    features: [
      {
        type: String,
        enum: [
          "wheelchair_accessible",
          "wifi",
          "air_conditioning",
          "usb_ports",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "maintenance", "retired"],
      default: "active",
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    currentRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
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

// Create a geospatial index for location-based queries
busSchema.index({ currentLocation: "2dsphere" });

// Update the updatedAt field before saving
busSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Bus", busSchema);
