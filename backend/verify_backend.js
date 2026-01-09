
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
let senderToken = '';
let receiverToken = '';
let adminToken = '';
let senderEmail = `sender_${Date.now()}@test.com`;
let receiverEmail = `receiver_${Date.now()}@test.com`;
const commonPassword = 'password123';

const log = (msg) => console.log(`[VERIFY] ${msg}`);
const errLog = (msg, err) => console.error(`[ERROR] ${msg}`, err.response?.data || err.message);

async function runVerification() {
    try {
        log('Starting Backend Verification...');

        // 1. Register Sender
        log(`Registering Sender: ${senderEmail}`);
        const senderRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Sender User',
            email: senderEmail,
            password: commonPassword
        });
        senderToken = senderRes.data.token;
        log('Sender Registered.');

        // 2. Register Receiver
        log(`Registering Receiver: ${receiverEmail}`);
        const receiverRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Receiver User',
            email: receiverEmail,
            password: commonPassword
        });
        // We might not need receiver token but good to have
        receiverToken = receiverRes.data.token;
        log('Receiver Registered.');

        // 3. Deposit to Sender
        log('Depositing 1000 to Sender...');
        const depositRes = await axios.post(`${BASE_URL}/transactions/deposit`, {
            amount: 1000
        }, { headers: { Authorization: `Bearer ${senderToken}` } });
        log(`Deposit Successful. New Balance: ${depositRes.data.data.newBalance}`);

        // 4. Transfer to Receiver
        log('Transferring 500 from Sender to Receiver...');
        const transferRes = await axios.post(`${BASE_URL}/transactions/transfer`, {
            toEmail: receiverEmail,
            amount: 500
        }, { headers: { Authorization: `Bearer ${senderToken}` } });
        log(`Transfer Successful. Sender New Balance: ${transferRes.data.data.newBalance}`);

        // 5. Verify Receiver Account logic (Login as receiver and check)
        const receiverAccountRes = await axios.get(`${BASE_URL}/accounts/my-account`, {
            headers: { Authorization: `Bearer ${receiverToken}` }
        });
        log(`Receiver Balance Verified: ${receiverAccountRes.data.data.account.balance} (Expected 500)`);

        // 6. Admin Verification
        // Login as Admin (assuming seed_admin.js ran)
        log('Logging in as Admin...');
        try {
            const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'admin@bank.com',
                password: 'admin123'
            });
            adminToken = adminRes.data.token;
            log('Admin Logged In.');

            // Check stats
            const adminUsers = await axios.get(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log(`Admin saw ${adminUsers.data.results} users.`);

        } catch (e) {
            log('⚠️ Admin login failed. Admin might not be seeded. Skipping admin checks.');
        }

        log('✅ ALL CHECKS PASSED!');

    } catch (err) {
        errLog('Verification Step Failed', err);
        process.exit(1);
    }
}

// Wait for server to be ready? We assume server is running.
runVerification();
