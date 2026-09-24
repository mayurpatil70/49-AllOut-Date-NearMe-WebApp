const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
    try {
        // Standard ₹50 = 50 Coins recharge
        const options = { amount: 50 * 100, currency: "INR", receipt: `rcpt_${req.user._id}_${Date.now()}` };
        const order = await razorpay.orders.create(options);

        await Transaction.create({
            user: req.user._id,
            razorpayOrderId: order.id,
            amount: 50,
            coinsGranted: 50
        });

        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id, status: 'pending' });
        if (!transaction) return res.status(400).json({ message: "Transaction not found or processed" });

        transaction.status = 'success';
        transaction.razorpayPaymentId = razorpay_payment_id;
        await transaction.save();

        req.user.walletBalance += transaction.coinsGranted;
        await req.user.save();

        res.json({ message: "Payment verified", newBalance: req.user.walletBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unlockLifetimeAccess = async (req, res) => {
    try {
        if (req.user.hasLifetimeAccess) {
            return res.status(400).json({ message: "Lifetime access already unlocked." });
        }
        if (req.user.walletBalance < 9) {
            return res.status(400).json({ message: "Insufficient coins. Recharge ₹50 required." });
        }

        req.user.walletBalance -= 9;
        req.user.hasLifetimeAccess = true;
        await req.user.save();

        res.json({ message: "Lifetime access unlocked!", walletBalance: req.user.walletBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};