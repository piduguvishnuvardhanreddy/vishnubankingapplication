
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSecureFeatures() {
    try {
        const uniqueId = Date.now();
        const user = {
            name: `Secure User ${uniqueId}`,
            email: `secure${uniqueId}@example.com`,
            password: 'password123',
            pin: '1234'
        };

        console.log("1. Registering...");
        const regRes = await axios.post(`${API_URL}/auth/register`, user);
        const token = regRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Deposit WITHOUT PIN (Should Fail)
        console.log("2. Testing Deposit WITHOUT PIN (Should Fail)...");
        try {
            await axios.post(`${API_URL}/transactions/deposit`, { amount: 100 }, config);
            throw new Error("Deposit without PIN succeeded but should have failed!");
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data.message.includes('PIN')) {
                console.log("   Correctly rejected missing PIN.");
            } else {
                throw e;
            }
        }

        // 3. Deposit WITH PIN (Should Succeed)
        console.log("3. Testing Deposit WITH PIN...");
        await axios.post(`${API_URL}/transactions/deposit`, { amount: 500, pin: user.pin }, config);
        console.log("   Deposit success.");

        // 4. Check Secure Balance WITHOUT PIN (Should Fail)
        console.log("4. Testing Secure Balance WITHOUT PIN (Should Fail)...");
        try {
            await axios.post(`${API_URL}/accounts/balance-secure`, {}, config);
            throw new Error("Balance check without PIN succeeded but should have failed!");
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log("   Correctly rejected missing PIN.");
            } else {
                throw e;
            }
        }

        // 5. Check Secure Balance WITH PIN (Should Succeed)
        console.log("5. Testing Secure Balance WITH PIN...");
        const balRes = await axios.post(`${API_URL}/accounts/balance-secure`, { pin: user.pin }, config);
        console.log("   Balance retrieved:", balRes.data.data.balance);

        if (balRes.data.data.balance !== 500) {
            throw new Error(`Expected balance 500, got ${balRes.data.data.balance}`);
        }

        console.log("\n✅ SECURE FEATURES VERIFIED!");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED", err.response?.data || err.message);
        process.exit(1);
    }
}

testSecureFeatures();
