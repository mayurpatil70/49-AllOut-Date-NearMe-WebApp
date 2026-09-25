const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/create-order", createOrder); // Unprotected so unregistered users can pay the 9 INR fee
router.post("/verify", verifyPayment);

module.exports = router;
