const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Load env for backend folder explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Simple uncaught exception handler (log and exit)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err);
    process.exit(1);
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security & logging
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL, // Custom Production URL
            /\.vercel\.app$/ // Allow all Vercel deployments (Great for preview URLs)
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) return allowed.test(origin);
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Helpful for debugging
            callback(new Error(`CORS not allowed for origin: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Connect to MongoDB (uses your URI)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ status: 'fail', message: 'Not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('------- GLOBAL ERROR HANDLER -------');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request Body:', req.body);
    console.error('Request Headers:', req.headers);
    console.error('------------------------------------');

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
