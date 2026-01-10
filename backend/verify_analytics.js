
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAnalytics() {
    try {
        // 1. Login as the user created in verify_new_features.js or create a new one
        // Let's create a new one to ensure 0 stats initially.
        const uniqueId = Date.now();
        const user = {
            name: `Analytics User ${uniqueId}`,
            email: `analytics${uniqueId}@example.com`,
            password: 'password123',
            pin: '1234'
        };

        console.log("1. Registering new user...");
        const regRes = await axios.post(`${API_URL}/auth/register`, user);
        const token = regRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log("2. Fetching Analytics (Should be 0)...");
        let res = await axios.get(`${API_URL}/transactions/analytics`, config);
        console.log("   Stats:", res.data.data.monthlyIncome, res.data.data.monthlyExpenses);

        if (res.data.data.monthlyIncome !== 0 || res.data.data.monthlyExpenses !== 0) {
            throw new Error("New user should have 0 income and expenses");
        }

        // 3. Make a deposit
        console.log("3. Depositing 1000...");
        await axios.post(`${API_URL}/transactions/deposit`, { amount: 1000 }, config);

        // 4. Fetch Analytics again
        console.log("4. Fetching Analytics (Income should be 1000)...");
        res = await axios.get(`${API_URL}/transactions/analytics`, config);
        console.log("   Stats:", res.data.data.monthlyIncome, res.data.data.monthlyExpenses);

        if (res.data.data.monthlyIncome !== 1000) {
            throw new Error(`Expected Income 1000, got ${res.data.data.monthlyIncome}`);
        }

        // 5. Make a withdrawal
        console.log("5. Withdrawing 200...");
        await axios.post(`${API_URL}/transactions/withdraw`, { amount: 200, pin: user.pin }, config);

        // 6. Fetch Analytics again
        console.log("6. Fetching Analytics (Expense should be 200)...");
        res = await axios.get(`${API_URL}/transactions/analytics`, config);
        console.log("   Stats:", res.data.data.monthlyIncome, res.data.data.monthlyExpenses);

        if (res.data.data.monthlyExpenses !== 200) {
            throw new Error(`Expected Expenses 200, got ${res.data.data.monthlyExpenses}`);
        }

        console.log("\n✅ ANALYTICS VERIFIED!");

    } catch (err) {
        console.error("\n❌ ANALYTICS VERIFICATION FAILED", err.response?.data || err.message);
        process.exit(1);
    }
}

testAnalytics();
