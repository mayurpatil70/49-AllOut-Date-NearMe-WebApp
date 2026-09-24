const express = require('express');
const { unlockChat } = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/unlock', protect, unlockChat);

module.exports = router;