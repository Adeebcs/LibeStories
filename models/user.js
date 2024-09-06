const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    user_id: String,
    username: { type: String, unique: true }, // Ensure username is unique
    email: { type: String, unique: true }, // Ensure email is unique
    password: String, // Password is no longer required

    address: {
        house_number: String,
        street: String,
        state: String,
        country: String
    },
    phone: String,
    blocked: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    sessionId: { type: String }, // Field to store session ID
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Middleware to update the updated_at field on save
userSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);