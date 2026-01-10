
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).select('+password');
        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`User: ${u.email}, Has Password: ${!!u.password}`);
            if (!u.password) {
                console.warn(`WARNING: User ${u.email} has NO password field!`);
            }
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
