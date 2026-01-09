const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

exports.deposit = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount } = req.body;
        const account = await BankAccount.findOne({ user: req.user.id }).session(session);

        if (!account) {
            throw new Error('Account not found');
        }
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        account.balance += amount;
        await account.save();

        const transaction = await Transaction.create([{
            toAccount: account._id,
            amount,
            type: 'deposit',
            status: 'completed'
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ status: 'success', data: { transaction: transaction[0], newBalance: account.balance } });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: 'fail', message: err.message });
    } finally {
        session.endSession();
    }
};

exports.withdraw = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount } = req.body;
        const account = await BankAccount.findOne({ user: req.user.id }).session(session);

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

        const transaction = await Transaction.create([{
            fromAccount: account._id,
            amount,
            type: 'withdrawal',
            status: 'completed'
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ status: 'success', data: { transaction: transaction[0], newBalance: account.balance } });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: 'fail', message: err.message });
    } finally {
        session.endSession();
    }
};

exports.transfer = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { toEmail, amount } = req.body;

        // Sender Account
        const fromAccount = await BankAccount.findOne({ user: req.user.id }).session(session);
        if (!fromAccount) throw new Error('Your account not found');
        if (amount <= 0) throw new Error('Amount must be positive');
        if (fromAccount.balance < amount) throw new Error('Insufficient balance');

        // Receiver User -> Account
        const toUser = await User.findOne({ email: toEmail }).session(session);
        if (!toUser) throw new Error('Recipient user not found');

        const toAccount = await BankAccount.findOne({ user: toUser._id }).session(session);
        if (!toAccount) throw new Error('Recipient account not found');

        if (fromAccount._id.equals(toAccount._id)) {
            throw new Error('Cannot transfer to self');
        }

        // Perform Transfer
        fromAccount.balance -= amount;
        await fromAccount.save();

        toAccount.balance += amount;
        await toAccount.save();

        const transaction = await Transaction.create([{
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            type: 'transfer',
            status: 'completed'
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ status: 'success', data: { transaction: transaction[0], newBalance: fromAccount.balance } });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: 'fail', message: err.message });
    } finally {
        session.endSession();
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const account = await BankAccount.findOne({ user: req.user.id });
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const transactions = await Transaction.find({
            $or: [{ fromAccount: account._id }, { toAccount: account._id }]
        }).sort({ timestamp: -1 }).populate('fromAccount toAccount');

        res.status(200).json({ status: 'success', results: transactions.length, data: { transactions } });
    } catch (err) {
        next(err);
    }
};

exports.requestMoney = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fromEmail, amount } = req.body;

        const requesterAccount = await BankAccount.findOne({ user: req.user.id }).session(session);
        if (!requesterAccount) throw new Error('Your account not found');
        if (amount <= 0) throw new Error('Amount must be positive');

        const fromUser = await User.findOne({ email: fromEmail }).session(session);
        if (!fromUser) throw new Error('User to request from not found');

        const fromAccount = await BankAccount.findOne({ user: fromUser._id }).session(session);
        if (!fromAccount) throw new Error('Payer account not found');

        if (requesterAccount._id.equals(fromAccount._id)) {
            throw new Error('Cannot request money from self');
        }

        const transaction = await Transaction.create([{
            fromAccount: fromAccount._id,
            toAccount: requesterAccount._id,
            amount,
            type: 'request',
            status: 'pending'
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ status: 'success', message: 'Request sent', data: { transaction: transaction[0] } });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ status: 'fail', message: err.message });
    } finally {
        session.endSession();
    }
};
