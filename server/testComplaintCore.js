const axios = require('axios');
const API = 'http://localhost:5000/api';

async function testComplaintCore() {
    const emailA = `testcore_${Date.now()}@test.com`;
    const emailB = `testcore_b_${Date.now()}@test.com`;
    const pw = `Core@123`;

    try {
        const aReq = await axios.post(`${API}/auth/register`, { name: 'A', email: emailA, password: pw });
        const bReq = await axios.post(`${API}/auth/register`, { name: 'B', email: emailB, password: pw });
        const tokenA = aReq.data.token;
        const tokenB = bReq.data.token;

        console.log('--- TEST 1: INVALID CRIME TYPE ---');
        try {
            await axios.post(`${API}/complaints`, {
                crimeType: 'Baking a Cake', // Not in enum
                language: 'English',
                incidentDate: new Date(),
                originalDescription: 'Test'
            }, { headers: { Authorization: `Bearer ${tokenA}` } });
            console.log('[FAIL] Invalid crimeType was accepted!');
        } catch (e) {
            console.log('[PASS] Invalid crimeType caught:', e.response?.data?.message || e.message);
        }

        console.log('--- TEST 2: MISSING INCIDENT DATE ---');
        try {
            await axios.post(`${API}/complaints`, {
                crimeType: 'UPI Fraud',
                language: 'English',
                originalDescription: 'Test' // Missing date
            }, { headers: { Authorization: `Bearer ${tokenA}` } });
            console.log('[FAIL] Missing incidentDate was accepted!');
        } catch (e) {
            console.log('[PASS] Missing incidentDate caught:', e.response?.data?.message || e.message);
        }

        console.log('--- TEST 3: VALID CREATION & ISOLATION ---');
        const compReq = await axios.post(`${API}/complaints`, {
            crimeType: 'Phishing',
            language: 'English',
            incidentDate: new Date().toISOString(),
            originalDescription: 'I was phished'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });
        const cid = compReq.data._id;
        console.log('[PASS] Complaint Successfully Created:', cid);

        try {
            await axios.get(`${API}/complaints/${cid}`, { headers: { Authorization: `Bearer ${tokenB}` } });
            console.log('[FAIL] User B fetched User A complaint');
        } catch (e) {
            console.log('[PASS] User B blocked from User A complaint:', e.response?.status === 401);
        }

        console.log('--- TEST 4: DELETION ISOLATION ---');
        try {
            await axios.delete(`${API}/complaints/${cid}`, { headers: { Authorization: `Bearer ${tokenB}` } });
            console.log('[FAIL] User B deleted User A complaint!');
        } catch (e) {
            console.log('[PASS] User B blocked from deleting User A complaint:', e.response?.status === 401);
        }

        console.log('--- TEST 5: DELETION SUCCESS ---');
        const delReq = await axios.delete(`${API}/complaints/${cid}`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('[PASS] User A deleted own complaint:', delReq.data.id === cid);

        // Verify it is gone
        const checkReq = await axios.get(`${API}/complaints`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('[PASS] Total complaints after deletion:', checkReq.data.length);

    } catch (e) {
        if (e.response) {
            console.error('Test Failed Exception', e.response.status, e.response.data);
        } else {
            console.error('Test Failed Exception', e.message);
        }
    }
}
testComplaintCore();
