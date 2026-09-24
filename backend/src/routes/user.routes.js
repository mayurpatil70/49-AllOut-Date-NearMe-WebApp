const express = require('express');
const { updateLocation, getNearbyUsers } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Both routes require the user to be logged in
router.post('/location', protect, updateLocation);
router.get('/nearby', protect, getNearbyUsers);

module.exports = router;