const BankAccount = require('../models/BankAccount');

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
