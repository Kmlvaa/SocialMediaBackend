const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be at most 30 characters'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
});

module.exports = mongoose.model('User', UserSchema);