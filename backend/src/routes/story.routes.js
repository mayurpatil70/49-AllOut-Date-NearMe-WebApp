const express = require("express");
const router = express.Router();

// Import the Multer Cloudinary configuration
const { upload } = require("../config/cloudinary");

// Import the Story controllers
const { uploadStory, getStories } = require("../controllers/story.controller");

// Import the authentication middleware
const { protect } = require("../middleware/auth.middleware");

// Route to get all active stories (protected so only logged-in users can see them)
router.get("/", protect, getStories);

// Route to upload a new story
// 'media' must match the field name appended in your frontend FormData
router.post("/upload", protect, upload.single("media"), uploadStory);

module.exports = router;
