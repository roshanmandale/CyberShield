const axios = require('axios');
const API = 'http://localhost:5000/api';

async function testDashboardSecurity() {
    const emailA = `usera_${Date.now()}@test.com`;
    const emailB = `userb_${Date.now()}@test.com`;
    const pw = `SecTest@123`;

    try {
        const aReq = await axios.post(`${API}/auth/register`, { name: 'User A', email: emailA, password: pw });
        const bReq = await axios.post(`${API}/auth/register`, { name: 'User B', email: emailB, password: pw });
        const tokenA = aReq.data.token;
        const tokenB = bReq.data.token;

        console.log('Registered Users:', { tokenA: !!tokenA, tokenB: !!tokenB });

        const cReq = await axios.post(`${API}/complaints`, {
            crimeType: 'UPI Fraud',
            language: 'English',
            incidentDate: new Date().toISOString(),
            originalDescription: 'Test A'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });

        console.log('Complaint Created:', cReq.data._id);

        const statsA = await axios.get(`${API}/complaints/stats`, { headers: { Authorization: `Bearer ${tokenA}` } });
        console.log('[USER A STATS]', statsA.data.totalComplaints === 1 ? 'PASS' : 'FAIL', statsA.data);

        const statsB = await axios.get(`${API}/complaints/stats`, { headers: { Authorization: `Bearer ${tokenB}` } });
        console.log('[USER B STATS/ISOLATION]', statsB.data.totalComplaints === 0 ? 'PASS' : 'FAIL (Security Breach)', statsB.data);

    } catch (e) {
        if (e.response) {
            console.error('Test Failed Exception', e.response.status, e.response.data);
        } else {
            console.error('Test Failed Exception', e.message);
        }
    }
}
testDashboardSecurity();
