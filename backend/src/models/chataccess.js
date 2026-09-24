const mongoose = require('mongoose');

const chatAccessSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    validUntil: { type: Date, required: true }
}, { timestamps: true });

// Prevent duplicate active unlocks
chatAccessSchema.index({ user: 1, targetUser: 1 }, { unique: true });

module.exports = mongoose.model('ChatAccess', chatAccessSchema);