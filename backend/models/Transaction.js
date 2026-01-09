const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount'
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'transfer', 'request'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
