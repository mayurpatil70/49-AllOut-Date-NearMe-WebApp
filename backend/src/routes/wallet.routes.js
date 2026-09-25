const express = require("express");
const {
  createOrder,
  verifyPayment,
  unlockLifetimeAccess,
} = require("../controllers/wallet.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/unlock-lifetime", protect, unlockLifetimeAccess);

module.exports = router;
