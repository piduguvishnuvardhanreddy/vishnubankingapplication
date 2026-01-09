const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

exports.deposit = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const account = await BankAccount.findOne({ user: req.user.id });

        if (!account) {
            throw new Error('Account not found');
        }
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        account.balance += amount;
        await account.save();

        const transaction = await Transaction.create({
            toAccount: account._id,
            amount,
            type: 'deposit',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction: transaction, newBalance: account.balance } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.withdraw = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const account = await BankAccount.findOne({ user: req.user.id });

        if (!account) {
            throw new Error('Account not found');
        }
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        if (account.balance < amount) {
            throw new Error('Insufficient balance');
        }

        account.balance -= amount;
        await account.save();

        const transaction = await Transaction.create({
            fromAccount: account._id,
            amount,
            type: 'withdrawal',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction: transaction, newBalance: account.balance } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.transfer = async (req, res, next) => {
    try {
        const { toEmail, amount } = req.body;

        // Sender Account
        const fromAccount = await BankAccount.findOne({ user: req.user.id });
        if (!fromAccount) throw new Error('Your account not found');
        if (amount <= 0) throw new Error('Amount must be positive');
        if (fromAccount.balance < amount) throw new Error('Insufficient balance');

        // Receiver User -> Account
        const toUser = await User.findOne({ email: toEmail });
        if (!toUser) throw new Error('Recipient user not found');

        const toAccount = await BankAccount.findOne({ user: toUser._id });
        if (!toAccount) throw new Error('Recipient account not found');

        if (fromAccount._id.equals(toAccount._id)) {
            throw new Error('Cannot transfer to self');
        }

        // Perform Transfer
        fromAccount.balance -= amount;
        await fromAccount.save();

        toAccount.balance += amount;
        await toAccount.save();

        const transaction = await Transaction.create({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            type: 'transfer',
            status: 'completed'
        });

        res.status(200).json({ status: 'success', data: { transaction: transaction, newBalance: fromAccount.balance } });
    } catch (err) {
        // Note: Without sessions, if a step fails halfway, data might be inconsistent. 
        // But this is required for standalone DB support.
        res.status(400).json({ status: 'fail', message: err.message });
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
