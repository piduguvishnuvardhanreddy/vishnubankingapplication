require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const BankAccount = require('./models/BankAccount');

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const adminEmail = 'admin@bank.com';
        const adminPass = 'admin123';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️ Admin already exists.');
            console.log('Email:', adminEmail);
            process.exit(0);
        }

        console.log('Creating Admin User...');
        const newAdmin = await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPass,
            role: 'admin'
        });

        // Setup admin account (optional, but good for testing)
        await BankAccount.create({
            user: newAdmin._id,
            accountNumber: '9999999999',
            balance: 1000000,
            status: 'active'
        });

        console.log('✅ Admin Created Successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPass);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};

seedAdmin();
