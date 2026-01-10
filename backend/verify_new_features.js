
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testFullFlow() {
    try {
        const uniqueId = Date.now();
        const user = {
            name: `Test User ${uniqueId}`,
            email: `test${uniqueId}@example.com`,
            password: 'password123',
            pin: '1234'
        };

        // 1. Register
        console.log("1. Registering...");
        let res = await axios.post(`${API_URL}/auth/register`, user);
        console.log("   Register Success.");

        // Extract Cookie or Token
        // Backend sends token in JSON AND cookie. 
        // If we use token for Authorization header, we don't strictly need cookies unless backend enforces them.
        // My auth middleware (if standard generic) often checks `req.headers.authorization`.
        // Let's try Bearer token first.
        let token = res.data.token;
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        // 2. Login (Just to verify it works and wasn't just auto-login)
        console.log("2. Logging in...");
        res = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        console.log("   Login Success.");
        token = res.data.token;
        config = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Deposit
        console.log("3. Depositing...");
        try {
            res = await axios.post(`${API_URL}/transactions/deposit`, { amount: 1000 }, config);
            console.log("   Deposit Success. Balance:", res.data.data.newBalance);
        } catch (e) {
            console.error("   Deposit Failed:", e.response?.data || e.message);
            throw e;
        }

        // 4. Create another user to transfer TO
        const user2 = {
            name: `Receiver ${uniqueId}`,
            email: `receiver${uniqueId}@example.com`,
            password: 'password123',
            pin: '5678'
        };
        const res2 = await axios.post(`${API_URL}/auth/register`, user2);
        // We catch their account setup implicitly by registration.

        // 5. Transfer
        console.log("5. Transferring to new user...");
        try {
            res = await axios.post(`${API_URL}/transactions/transfer`, {
                toEmail: user2.email,
                amount: 200,
                pin: user.pin
            }, config);
            console.log("   Transfer Success. New Balance:", res.data.data.newBalance);
        } catch (e) {
            console.error("   Transfer Failed:", e.response?.data || e.message);
            throw e;
        }

        // 6. Withdraw (Verify PIN)
        console.log("6. Withdrawing...");
        try {
            res = await axios.post(`${API_URL}/transactions/withdraw`, {
                amount: 100,
                pin: user.pin
            }, config);
            console.log("   Withdraw Success. New Balance:", res.data.data.newBalance);
        } catch (e) {
            console.error("   Withdraw Failed:", e.response?.data || e.message);
            throw e;
        }

        // 7. Change PIN
        console.log("7. Changing PIN...");
        try {
            res = await axios.post(`${API_URL}/users/change-pin`, {
                currentPin: user.pin,
                newPin: '9999'
            }, config);
            console.log("   Change PIN Success.");
        } catch (e) {
            console.error("   Change PIN Failed:", e.response?.data || e.message);
            throw e;
        }

        // 8. Verify Old PIN fails
        console.log("8. Verifying Old PIN failure on Withdraw...");
        try {
            await axios.post(`${API_URL}/transactions/withdraw`, {
                amount: 10,
                pin: user.pin // Old pin
            }, config);
            console.error("   ERROR: Old PIN should have failed!");
            process.exit(1);
        } catch (e) {
            if (e.response && e.response.status === 401) {
                console.log("   Old PIN correctly rejected.");
            } else {
                console.error("   Unexpected Error:", e.message);
                throw e;
            }
        }

        // 9. Verify New PIN works
        console.log("9. Verifying New PIN works...");
        try {
            res = await axios.post(`${API_URL}/transactions/withdraw`, {
                amount: 10,
                pin: '9999'
            }, config);
            console.log("   New PIN Success. Balance:", res.data.data.newBalance);
        } catch (e) {
            console.error("   New PIN Failed:", e.response?.data || e.message);
            throw e;
        }

        console.log("\n✅ ALL NEW FEATURES VERIFIED!");

    } catch (err) {
        console.error("\n❌ VERIFICATION SCRIPT FAILED", err.response?.data || err.message);
        process.exit(1);
    }
}

testFullFlow();
