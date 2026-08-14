const axios = require('axios');

async function testRenderAuth() {
    try {
        const r = await axios.post('https://cybershield-u9rs.onrender.com/api/auth/register', {
            name: 'ProdA', email: `proda_${Date.now()}@test.com`, password: 'Ai@123'
        });
        console.log('Register HTTP Status:', r.status);
        console.log('Register Body Message:', r.data.message);
    } catch (e) {
        console.log('Register Fail HTTP Status:', e.response?.status);
        console.log('Register Fail Body Message:', e.response?.data?.message);
    }
}
testRenderAuth();
