const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ status: 'fail', message: 'Name and email are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        user.name = name;
        user.email = email;
        await user.save();

        res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: 'fail', message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
