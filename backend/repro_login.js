
const axios = require('axios');

async function testLogin() {
    try {
        console.log("Attempting login...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@bank.com',
            password: 'admin123'
        });
        console.log("Login Success:", res.data);
    } catch (err) {
        console.error("Login Failed Status:", err.response ? err.response.status : 'Unknown');
        console.error("Login Failed Data:", err.response ? err.response.data : err.message);
    }
}

testLogin();
