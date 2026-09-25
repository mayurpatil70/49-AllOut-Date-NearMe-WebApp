const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    walletBalance: { type: Number, default: 0 },
    hasLifetimeAccess: { type: Boolean, default: false },

    // New Profile Fields
    profilePhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1575909137/avatar.png", // Default placeholder
    },
    bio: {
      type: String,
      maxLength: 500,
      default: "",
    },

    // Geolocation (Already existing, kept for context)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },

    // Password Reset Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

// Ensure geospatial index is maintained
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
