const axios = require('axios');

async function testRender() {
    try {
        console.log('Testing /api/health ...');
        const h = await axios.get('https://cybershield-u9rs.onrender.com/api/health');
        console.log('Health:', h.status, h.data);
    } catch (e) {
        console.log('Health Fail:', e.message);
    }

    try {
        console.log('Testing /api/auth/register ...');
        const r = await axios.post('https://cybershield-u9rs.onrender.com/api/auth/register', {
            name: 'ProdA', email: `proda_${Date.now()}@test.com`, password: 'Ai@123'
        });
        console.log('Register:', r.status, Object.keys(r.data));
    } catch (e) {
        console.log('Register Fail:', e.response?.status, e.response?.data);
    }
}
testRender();
