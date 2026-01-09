
const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

async function verifyFeatures() {
    try {
        console.log("Verifying Features...");

        // 1. Login as Admin/Sender (from previous runs context)
        // Let's just register/login new ones to be clean
        const email1 = `req_sender_${Date.now()}@test.com`;
        const email2 = `req_receiver_${Date.now()}@test.com`;

        console.log("- Registering User 1...");
        const res1 = await axios.post(`${BASE_URL}/auth/register`, { name: 'User 1', email: email1, password: 'password' });
        const token1 = res1.data.token;

        console.log("- Registering User 2...");
        await axios.post(`${BASE_URL}/auth/register`, { name: 'User 2', email: email2, password: 'password' });

        // 2. User 1 Requests from User 2
        console.log("- User 1 requesting 500 from User 2...");
        const reqRes = await axios.post(`${BASE_URL}/transactions/request`, {
            fromEmail: email2,
            amount: 500
        }, { headers: { Authorization: `Bearer ${token1}` } });

        if (reqRes.data.data.transaction.type === 'request' && reqRes.data.data.transaction.status === 'pending') {
            console.log("✅ Request Money Transaction Created Successfully!");
        } else {
            console.error("❌ Request Money Failed checks", reqRes.data);
            process.exit(1);
        }

        // 3. Check History for User 1
        console.log("- Checking History for User 1...");
        const histRes = await axios.get(`${BASE_URL}/transactions/history`, { headers: { Authorization: `Bearer ${token1}` } });
        const tx = histRes.data.data.transactions.find(t => t.type === 'request');
        if (tx) {
            console.log("✅ Request appears in history.");
        } else {
            console.error("❌ Request NOT found in history");
        }

    } catch (err) {
        console.error("❌ Verification Failed:", err.response?.data || err.message);
        process.exit(1);
    }
}

verifyFeatures();
