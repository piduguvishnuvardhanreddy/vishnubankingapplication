require('dotenv').config();
const mongoose = require('mongoose');

console.log("Testing MongoDB Connection...");
const uri = process.env.MONGODB_URI;
console.log("URI present:", !!uri);

if (!uri) {
    console.error("❌ MONGODB_URI is missing in .env");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connection SUCCESSFUL!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection FAILED");
        console.error(err.message);
        process.exit(1);
    });
