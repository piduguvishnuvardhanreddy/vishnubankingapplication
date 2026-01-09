// audit_imports.js
// This script requires all key files to ensure no missing modules
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

console.log('Testing imports...');

try {
    // Models
    console.log('Checking Models...');
    require('./models/User');
    require('./models/BankAccount');
    require('./models/Transaction');
    require('./models/AuditLog');

    // Controllers
    console.log('Checking Controllers...');
    require('./controllers/authController');
    require('./controllers/userController');
    require('./controllers/accountController');
    require('./controllers/transactionController');
    require('./controllers/adminController');
    require('./controllers/analyticsController');

    // Routes
    console.log('Checking Routes...');
    require('./routes/authRoutes');
    require('./routes/userRoutes');
    require('./routes/accountRoutes');
    require('./routes/transactionRoutes');
    require('./routes/adminRoutes');

    console.log('✅ All imports successful!');
    process.exit(0);
} catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
}
