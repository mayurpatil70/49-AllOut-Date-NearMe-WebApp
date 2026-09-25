const mongoose = require("mongoose");

const chatAccessSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Index to quickly check active chat permissions and automatically drop expired records
chatAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
chatAccessSchema.index({ buyerId: 1, targetUserId: 1 }, { unique: true });

module.exports = mongoose.model("ChatAccess", chatAccessSchema);
