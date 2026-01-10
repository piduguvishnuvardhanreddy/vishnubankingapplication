const Transaction = require('../models/Transaction');
const Account = require('../models/BankAccount');

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

        // Calculate current month stats separately for Dashboard Cards
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthStats = await Transaction.aggregate([
            {
                $match: {
                    $or: [{ fromAccount: account._id }, { toAccount: account._id }],
                    timestamp: { $gte: startOfMonth },
                    status: 'completed'
                }
            },
            {
                $project: {
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
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        let monthlyIncome = 0;
        let monthlyExpenses = 0;

        currentMonthStats.forEach(stat => {
            if (stat._id === 'credit') monthlyIncome = stat.total;
            if (stat._id === 'debit') monthlyExpenses = stat.total;
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                monthlyIncome,
                monthlyExpenses
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
