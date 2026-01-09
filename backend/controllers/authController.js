const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const AuditLog = require('../models/AuditLog');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

exports.register = async (req, res, next) => {
    console.log("Register request received:", req.body); // LOG INPUT
    
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Missing name, email or password' });
        }

        // Check existing
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'Email already in use' });
        }

        // 1. Create User
        console.log("Creating user...");
        const newUser = await User.create({
            name,
            email,
            password
        });
        console.log("User created:", newUser._id);

        // 2. Create Bank Account
        console.log("Creating bank account...");
        // Ensure unique account number
        let accountNumber;
        let isUnique = false;
        while (!isUnique) {
             accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
             const existingAcc = await BankAccount.findOne({ accountNumber });
             if (!existingAcc) isUnique = true;
        }

        const newAccount = await BankAccount.create({
            user: newUser._id,
            accountNumber: accountNumber,
            balance: 0,
            status: 'active'
        });
        console.log("Bank account created:", newAccount._id);

        // 3. Audit Log
        try {
            await AuditLog.create({
                user: newUser._id,
                action: 'USER_REGISTER',
                ipAddress: req.ip || 'unknown'
            });
        } catch (auditErr) {
            console.error("Audit log failed but ignoring:", auditErr.message);
        }

        createSendToken(newUser, 201, res);
    } catch (err) {
        console.error("Register Error:", err);

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                status: 'fail',
                message: errors.join('. ')
            });
        }

        // Duplicate key (email unique)
        if (err.code === 11000) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use'
            });
        }

        return res.status(500).json({
            status: 'error',
            message: err.message || 'Registration failed'
        });
    }
};

exports.login = async (req, res, next) => {
    console.log("Login request for:", req.body.email);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
        }

        // Check user & password
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            // Log failed attempt
             await AuditLog.create({
                action: 'LOGIN_FAILED',
                details: { email },
                ipAddress: req.ip || 'unknown'
            });
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
        }

        await AuditLog.create({
            user: user._id,
            action: 'LOGIN_SUCCESS',
            ipAddress: req.ip || 'unknown'
        });

        createSendToken(user, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Login failed'
        });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};
