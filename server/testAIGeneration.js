const axios = require('axios');
const API = 'http://localhost:5000/api';

async function testAI() {
    const emailA = `testai_${Date.now()}@test.com`;

    try {
        const aReq = await axios.post(`${API}/auth/register`, { name: 'A', email: emailA, password: 'AI@1233' });
        const token = aReq.data.token;

        console.log('--- TEST NVIDIA AI (English) ---');
        const aiReq = await axios.post(`${API}/complaints/draft`, {
            crimeType: 'UPI Fraud',
            language: 'English',
            description: 'I lost 5000 Rs on Monday because a guy told me to scan a QR code for a reward'
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('[PASS] AI Request Success');
        console.log('[JSON OUTPUT]', aiReq.data);

        console.log('--- TEST NVIDIA AI (Hindi) ---');
        const aiReqHi = await axios.post(`${API}/complaints/draft`, {
            crimeType: 'Phishing',
            language: 'Hindi',
            description: 'mujhe ek fake bank sms aaya aur maine click kiya toh paise gaye'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('[PASS] AI Request Success (Hindi)');
        console.log('[JSON OUTPUT]', aiReqHi.data);

    } catch (e) {
        if (e.response) {
            console.error('Test Failed Exception', e.response.status, e.response.data);
        } else {
            console.error('Test Failed Exception', e.message);
        }
    }
}
testAI();
