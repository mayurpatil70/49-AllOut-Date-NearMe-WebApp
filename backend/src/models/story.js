const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrl: { type: String }, // Populated via Cloudinary upload
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 86400 // Automatically deletes the document after 24 hours
    }
});

// 2dsphere index allows nearby users to query stories around them
storySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Story', storySchema);