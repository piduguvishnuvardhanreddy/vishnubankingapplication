const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative'] // Simplified, though credit lines might allow negative
    },
    status: {
        type: String,
        enum: ['active', 'frozen', 'closed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
