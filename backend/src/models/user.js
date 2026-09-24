const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    hasLifetimeAccess: { type: Boolean, default: false }, // Requires 9 coins to become true
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    walletBalance: { type: Number, default: 0 },
    fcmToken: { type: String }, // For push notifications
    profileImage: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);