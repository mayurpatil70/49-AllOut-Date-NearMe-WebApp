const express = require("express");
const router = express.Router();

// Single import for all auth controllers
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
