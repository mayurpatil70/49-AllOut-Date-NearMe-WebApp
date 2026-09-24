const ChatAccess = require('../models/ChatAccess');

exports.unlockChat = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const user = req.user;

        if (!user.hasLifetimeAccess) {
            return res.status(403).json({ message: "Unlock lifetime access (9 coins) first." });
        }

        const existingAccess = await ChatAccess.findOne({ user: user._id, targetUser: targetUserId });
        if (existingAccess && existingAccess.validUntil > new Date()) {
            return res.status(400).json({ message: "Chat is already unlocked for this user." });
        }

        if (user.walletBalance < 1) {
            return res.status(400).json({ message: "Insufficient coins to unlock chat." });
        }

        user.walletBalance -= 1;
        await user.save();

        const validUntilDate = new Date();
        validUntilDate.setDate(validUntilDate.getDate() + 15);

        if (existingAccess) {
            existingAccess.validUntil = validUntilDate;
            await existingAccess.save();
        } else {
            await ChatAccess.create({ user: user._id, targetUser: targetUserId, validUntil: validUntilDate });
        }

        res.json({ message: "Chat unlocked for 15 days.", walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};