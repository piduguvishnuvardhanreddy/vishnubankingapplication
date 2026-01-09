const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

exports.getAnalytics = async (req, res) => {
    try {
        const account = await Account.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Account not found' });
        }

        // Get monthly stats for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const stats = await Transaction.aggregate([
            {
                $match: {
                    $or: [{ fromAccount: account._id }, { toAccount: account._id }],
                    timestamp: { $gte: sixMonthsAgo },
                    status: 'completed'
                }
            },
            {
                $project: {
                    month: { $month: '$timestamp' },
                    year: { $year: '$timestamp' },
                    amount: 1,
                    type: {
                        $cond: {
                            if: { $eq: ['$toAccount', account._id] },
                            then: 'credit',
                            else: 'debit'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year', type: '$type' },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Process stats into chart-friendly format
        // We will process this on frontend or here. Let's send raw stats.

        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
