const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');
const resend = require('../config/resend');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
    try {
        const { email, password, gender } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword, gender });

        const otp = Math.floor(100000 + Math.random() * 900000);
        await redisClient.set(`otp:${email}`, otp, { EX: 300 }); // Expires in 5 mins

        await resend.emails.send({
            from: 'onboarding@yourdomain.com', // Replace when you have a verified domain
            to: email,
            subject: 'Verify your NearMe account',
            html: `<p>Your OTP is: <strong>${otp}</strong>. Valid for 5 minutes.</p>`
        });

        res.status(201).json({ message: 'User registered. OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = await redisClient.get(`otp:${email}`);

        if (storedOtp !== otp) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true });
        await redisClient.del(`otp:${email}`);

        res.json({
            message: 'Email verified successfully',
            token: generateToken(user._id),
            user: { id: user._id, email: user.email, hasLifetimeAccess: user.hasLifetimeAccess, walletBalance: user.walletBalance }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isEmailVerified) return res.status(401).json({ message: 'Please verify your email first' });
            
            res.json({
                token: generateToken(user._id),
                user: { id: user._id, email: user.email, hasLifetimeAccess: user.hasLifetimeAccess, walletBalance: user.walletBalance }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};