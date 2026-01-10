const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

exports.getMyAccount = async (req, res, next) => {
    try {
        const account = await BankAccount.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found' });
        }
        res.status(200).json({ status: 'success', data: { account } });
    } catch (err) {
        next(err);
    }
};

exports.getSecureBalance = async (req, res, next) => {
    try {
        const { pin } = req.body;
        if (!pin) return res.status(400).json({ status: 'fail', message: 'Please provide PIN' });

        const user = await User.findById(req.user.id).select('+pin');
        if (!user || !(await user.correctPin(pin, user.pin))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect PIN' });
        }

        const account = await BankAccount.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found' });
        }
        res.status(200).json({ status: 'success', data: { balance: account.balance } });
    } catch (err) {
        next(err);
    }
};
