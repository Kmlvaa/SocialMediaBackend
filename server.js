require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

const app = express();

const PORT = process.env.PORT || 5000;
const JWT = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => (console.log('MongoDB connected.')))
    .catch((err) => console.log('MongoDB ERROR: ', err));


app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return res.status(400).json({ message: 'User already exists!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'User registered!' });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(' | ') });
        }

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `The ${field} is already in use.` });
        }

        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password, rememberMe } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'User not found!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials!' });

    const token = jwt.sign({ id: user._id }, JWT, {
        expiresIn: rememberMe ? '7d' : '1h',
    })
    res.json({ message: 'Login successful!', token });
});

app.get('/', (req, res) => {
    res.send('✅ Backend is working!');
});

app.listen(PORT, () => console.log(`SERVER RUNNING AT http://localhost:${PORT}`));

