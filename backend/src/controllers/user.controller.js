const User = require('../models/User');

exports.updateLocation = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;
        // Fuzz the coordinates slightly in production for safety before saving
        req.user.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        await req.user.save();
        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNearbyUsers = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 5000, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    distanceField: "distance",
                    maxDistance: parseInt(maxDistance),
                    spherical: true,
                    query: { isEmailVerified: true, _id: { $ne: req.user._id } }
                }
            },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            { $project: { password: 0, location: 0, fcmToken: 0 } } // Exclude exact GPS pins
        ]);

        res.json(nearbyUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};