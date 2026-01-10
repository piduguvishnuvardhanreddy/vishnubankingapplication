const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

exports.deposit = async (req, res, next) => {
    try {
        const { amount, pin } = req.body;
        if (!amount || !pin) {
            return res.status(400).json({ status: 'fail', message: 'Please provide amount and PIN' });
        }
        if (amount <= 0) {
            return res.status(400).json({ status: 'fail', message: 'Amount must be positive' });
        }

        // Verify PIN
        const user = await User.findById(req.user.id).select('+pin');
        if (!user || !(await user.correctPin(pin, user.pin))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect PIN' });
        }

        // Atomic update
        const account = await BankAccount.findOneAndUpdate(
            { user: req.user.id },
            { $inc: { balance: amount } },
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found. Please contact support.' });
        }

        const transaction = await Transaction.create({
            toAccount: account._id,
            amount,
            type: 'deposit',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction, newBalance: account.balance } });
    } catch (err) {
        console.error("Deposit Error:", err);
        res.status(500).json({ status: 'error', message: err.message || 'Deposit failed' });
    }
};

exports.withdraw = async (req, res, next) => {
    try {
        const { amount, pin } = req.body;
        if (!amount || !pin) {
            return res.status(400).json({ status: 'fail', message: 'Please provide amount and PIN' });
        }
        if (amount <= 0) {
            return res.status(400).json({ status: 'fail', message: 'Amount must be positive' });
        }

        // Verify PIN
        const user = await User.findById(req.user.id).select('+pin');
        if (!user || !(await user.correctPin(pin, user.pin))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect PIN' });
        }

        const fs = require('fs');
        fs.appendFileSync('debug.log', `DEBUG Withdrawal: User ID: ${req.user.id}\n`);
        const account = await BankAccount.findOne({ user: req.user.id });
        fs.appendFileSync('debug.log', `DEBUG Withdrawal: Account Found: ${!!account}\n`);
        if (account) fs.appendFileSync('debug.log', `DEBUG Withdrawal: Account Data: ${JSON.stringify(account)}\n`);

        if (!account) {
            return res.status(404).json({ status: 'fail', message: `Account not found for user ${req.user.id}` });
        }
        if (account.balance < amount) {
            return res.status(400).json({ status: 'fail', message: 'Insufficient balance' });
        }

        // Atomic decrement
        const updatedAccount = await BankAccount.findOneAndUpdate(
            { user: req.user.id, balance: { $gte: amount } }, // Extra safety check in query
            { $inc: { balance: -amount } },
            { new: true }
        );

        if (!updatedAccount) {
            // Race condition check: balance might have changed between read and write
            return res.status(400).json({ status: 'fail', message: 'Insufficient balance or transaction failed' });
        }

        const transaction = await Transaction.create({
            fromAccount: account._id,
            amount,
            type: 'withdrawal',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction, newBalance: updatedAccount.balance } });
    } catch (err) {
        console.error("Withdraw Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.transfer = async (req, res, next) => {
    try {
        const { toEmail, amount, pin } = req.body;
        if (!toEmail || !amount || !pin) {
            return res.status(400).json({ status: 'fail', message: 'Please provide recipient email, amount, and PIN' });
        }

        // Verify PIN
        const user = await User.findById(req.user.id).select('+pin');
        if (!user || !(await user.correctPin(pin, user.pin))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect PIN' });
        }

        // Sender Account
        const fromAccount = await BankAccount.findOne({ user: req.user.id });
        if (!fromAccount) return res.status(404).json({ status: 'fail', message: 'Your account not found' });
        if (amount <= 0) return res.status(400).json({ status: 'fail', message: 'Amount must be positive' });
        if (fromAccount.balance < amount) return res.status(400).json({ status: 'fail', message: 'Insufficient balance' });

        // Receiver User -> Account
        const toUser = await User.findOne({ email: toEmail });
        if (!toUser) return res.status(404).json({ status: 'fail', message: 'Recipient user not found' });

        const toAccount = await BankAccount.findOne({ user: toUser._id });
        if (!toAccount) return res.status(404).json({ status: 'fail', message: 'Recipient account not found' });

        if (fromAccount._id.equals(toAccount._id)) {
            return res.status(400).json({ status: 'fail', message: 'Cannot transfer to self' });
        }

        // Perform Transfer (Atomic-ish)
        // 1. Deduct from sender
        const updatedSender = await BankAccount.findOneAndUpdate(
            { _id: fromAccount._id, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { new: true }
        );

        if (!updatedSender) {
            return res.status(400).json({ status: 'fail', message: 'Insufficient balance or transaction failed' });
        }

        // 2. Add to receiver (If this fails, we effectively burned money - in prod, use Transactions/Two-Phase Commit)
        // For this simple app, we assume reliability or manual fix.
        try {
            await BankAccount.findOneAndUpdate(
                { _id: toAccount._id },
                { $inc: { balance: amount } }
            );
        } catch (addErr) {
            // CRITICAL: Money lost state. Log heavily.
            console.error(`CRITICAL: Transfer deduction successful but addition failed. From: ${fromAccount._id}, To: ${toAccount._id}, Amount: ${amount}`);
            // Attempt rollback
            await BankAccount.findOneAndUpdate({ _id: fromAccount._id }, { $inc: { balance: amount } });
            return res.status(500).json({ status: 'error', message: 'Transfer failed. Money refunded.' });
        }

        const transaction = await Transaction.create({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            type: 'transfer',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction, newBalance: updatedSender.balance } });
    } catch (err) {
        console.error("Transfer Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const account = await BankAccount.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found' });
        }

        const { type, startDate, endDate, search } = req.query;

        let query = {
            $or: [{ fromAccount: account._id }, { toAccount: account._id }]
        };

        if (type && type !== 'all') {
            query.type = type;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Search: Simple check on Amount (exact)
        if (search) {
            // Check if search is a number
            if (!isNaN(search)) {
                query.amount = Number(search);
            }
        }

        const transactions = await Transaction.find(query)
            .sort({ timestamp: -1 })
            .populate('fromAccount', 'accountNumber')
            .populate('toAccount', 'accountNumber');

        res.status(200).json({
            status: 'success',
            results: transactions.length,
            data: { transactions }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.requestMoney = async (req, res, next) => {
    try {
        const { fromEmail, amount } = req.body;

        const requesterAccount = await BankAccount.findOne({ user: req.user.id });
        if (!requesterAccount) throw new Error('Your account not found');
        if (amount <= 0) throw new Error('Amount must be positive');

        const fromUser = await User.findOne({ email: fromEmail });
        if (!fromUser) throw new Error('User to request from not found');

        const fromAccount = await BankAccount.findOne({ user: fromUser._id });
        if (!fromAccount) throw new Error('Payer account not found');

        if (requesterAccount._id.equals(fromAccount._id)) {
            throw new Error('Cannot request money from self');
        }

        const transaction = await Transaction.create({
            fromAccount: fromAccount._id,
            toAccount: requesterAccount._id,
            amount,
            type: 'request',
            status: 'pending'
        });

        res.status(200).json({ status: 'success', message: 'Request sent', data: { transaction: transaction } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
