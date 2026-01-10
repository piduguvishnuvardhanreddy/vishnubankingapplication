
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testUpload() {
    try {
        const uniqueId = Date.now();
        const user = {
            name: `Upload User ${uniqueId}`,
            email: `upload${uniqueId}@example.com`,
            password: 'password123',
            pin: '1234'
        };

        // 1. Register
        console.log("1. Registering...");
        const regRes = await axios.post(`${API_URL}/auth/register`, user);
        const token = regRes.data.token;

        // 2. Create Dummy Image
        const dummyPath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(dummyPath, 'This is a test image content acting as image');

        // 3. Upload Image (Note: Backend expects image mimetype, so we might need to fake it or use a real extension check)
        // My multer config checks file.mimetype.startsWith('image/')
        // form-data library lets us set options.

        const form = new FormData();
        form.append('name', 'Updated Name');
        form.append('email', user.email);
        form.append('profilePicture', fs.createReadStream(dummyPath), {
            filename: 'test.png',
            contentType: 'image/png'
        });

        console.log("2. Uploading Profile Picture...");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            }
        };

        const res = await axios.patch(`${API_URL}/users/profile`, form, config);
        console.log("   Upload Success. User Data:", res.data.data.user.profilePicture);

        if (!res.data.data.user.profilePicture || !res.data.data.user.profilePicture.includes('uploads/')) {
            throw new Error("Profile picture path not returned correctly");
        }

        // 4. Verify Static File Access
        // The backend returns something like 'uploads/user-....png'
        // We set up static access at /uploads, so 'http://localhost:5000/uploads/...' should work?
        // Wait, app.use('/uploads', ...) mounts it at /uploads.
        // And user.profilePicture IS 'uploads/filename'.
        // So http://localhost:5000/uploads/filename IS WRONG if path is 'uploads/filename'.
        // It would be http://localhost:5000/uploads/uploads/filename if I am not careful.

        // Let's check what I saved.
        // user.profilePicture = `uploads/${req.file.filename}`;
        // app.use('/uploads', express.static(...));
        // URL construction: http://localhost:5000/uploads/filename
        // Saved path: uploads/filename
        // So we need to request: http://localhost:5000/uploads/filename
        // BUT 'uploads' in URL maps to static folder 'uploads'.
        // The file inside static folder is 'filename'.
        // So http://localhost:5000/uploads/filename works.
        // BUT my saved path is 'uploads/filename'.
        // So if I prepend baseurl: http://localhost:5000/uploads/filename
        // The saved path includes 'uploads/'.
        // So I should request http://localhost:5000/ + 'uploads/filename' = http://localhost:5000/uploads/filename.
        // Yes, that works.

        console.log("3. Verifying File Access...");
        const fileUrl = `http://localhost:5000/${res.data.data.user.profilePicture}`;
        console.log("   Fetching:", fileUrl);

        const fileRes = await axios.get(fileUrl);
        if (fileRes.status === 200) {
            console.log("   File is accessible!");
        }

        console.log("\n✅ UPLOAD VERIFIED!");

        // Cleanup
        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error("\n❌ UPLOAD VERIFICATION FAILED", err.response?.data || err.message);
        if (err.response) console.error(err.response.data);
        process.exit(1);
    }
}

testUpload();
