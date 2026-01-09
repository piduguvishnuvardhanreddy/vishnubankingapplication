const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const AuditLog = require('../models/AuditLog');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ status: 'success', results: users.length, data: { users } });
    } catch (err) {
        next(err);
    }
};

exports.getAllAccounts = async (req, res, next) => {
    try {
        const accounts = await BankAccount.find().populate('user', 'name email');
        res.status(200).json({ status: 'success', results: accounts.length, data: { accounts } });
    } catch (err) {
        next(err);
    }
};

exports.updateAccountStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const account = await BankAccount.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found' });
        }

        await AuditLog.create({
            user: req.user.id,
            action: 'ADMIN_UPDATE_ACCOUNT_STATUS',
            details: { accountId: req.params.id, newStatus: status },
            ipAddress: req.ip
        });

        res.status(200).json({ status: 'success', data: { account } });
    } catch (err) {
        next(err);
    }
};
