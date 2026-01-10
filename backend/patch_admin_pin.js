
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const patchAdmin = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        const admin = await User.findOne({ email: 'admin@bank.com' }).select('+pin');
        if (!admin) {
            console.log('Admin not found.');
            process.exit(0);
        }

        if (admin.pin) {
            console.log('Admin already has a PIN.');
            process.exit(0);
        }

        console.log('Setting default PIN: 1234');
        // Manually hash because using save() might trigger other validators or password re-hash if logic is flawed
        // But our logic checks 'isModified'. So saving should be fine.
        admin.pin = '1234';
        await admin.save();

        console.log('Admin PIN set successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Patch failed:', err);
        process.exit(1);
    }
};

patchAdmin();
