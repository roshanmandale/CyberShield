const axios = require('axios');
const API = 'http://localhost:5000/api/auth';

async function testAuth() {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const password = `Test@12345`;
    let token = '';

    console.log('--- STARTING AUTH TESTS ---');

    try {
        // 1. Register Success
        const resReg = await axios.post(`${API}/register`, { name: 'Test User', email: uniqueEmail, password });
        console.log('[PASS] Registration:', resReg.data.name === 'Test User');
        token = resReg.data.token;
    } catch (err) {
        console.log('[FAIL] Registration', err.response?.data || err.message);
    }

    try {
        // 2. Duplicate Email
        await axios.post(`${API}/register`, { name: 'Duplicate', email: uniqueEmail, password });
        console.log('[FAIL] Duplicate Email (Expected error)');
    } catch (err) {
        console.log('[PASS] Duplicate Email (Caught):', err.response?.data?.message === 'User already exists');
    }

    try {
        // 3. Login Wrong Password
        await axios.post(`${API}/login`, { email: uniqueEmail, password: 'WrongPassword' });
        console.log('[FAIL] Wrong Password (Expected error)');
    } catch (err) {
        console.log('[PASS] Wrong Password (Caught):', err.response?.data?.message === 'Invalid credentials');
    }

    try {
        // 4. Login Invalid Email
        await axios.post(`${API}/login`, { email: 'nonexistent@example.com', password });
        console.log('[FAIL] Invalid Email (Expected error)');
    } catch (err) {
        console.log('[PASS] Invalid Email (Caught):', err.response?.data?.message === 'Invalid credentials');
    }

    try {
        // 5. Login Success
        const resLog = await axios.post(`${API}/login`, { email: uniqueEmail, password });
        console.log('[PASS] Login Success:', !!resLog.data.token);
    } catch (err) {
        console.log('[FAIL] Login Success', err.response?.data || err.message);
    }

    try {
        // 6. Protected Route with Token
        const resMe = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('[PASS] Protected Route (Valid Token):', resMe.data.email === uniqueEmail);
    } catch (err) {
        console.log('[FAIL] Protected Route (Valid)', err.response?.data || err.message);
    }

    try {
        // 7. Protected Route without Token
        await axios.get(`${API}/me`);
        console.log('[FAIL] Protected Route (No Token) (Expected error)');
    } catch (err) {
        console.log('[PASS] Protected Route (No Token) (Caught):', err.response?.status === 401);
    }
}
testAuth();
