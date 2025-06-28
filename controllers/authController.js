const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return res.status(400).json({ message: 'User already exists!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'User registered!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'User not found!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials!' });

        const token = jwt.sign({ id: user._id }, JWT, {
            expiresIn: rememberMe ? '7d' : '1h',
        });

        res.json({ message: 'Login successful!', token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};