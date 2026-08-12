const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API = 'http://localhost:5000/api';

async function logResult(name, promise, expectedSuccess) {
    try {
        const res = await promise;
        if (expectedSuccess) {
            console.log(`[PASS] ${name}`);
            return res;
        } else {
            console.log(`[FAIL] ${name} - Unexpectedly Succeeded!`);
        }
    } catch (e) {
        if (!expectedSuccess) {
            console.log(`[PASS] ${name} - Rejected correctly (${e.response?.data?.message || 'Error'})`);
        } else {
            console.log(`[FAIL] ${name} - Threw error:`, e.response?.data?.message || e.message);
        }
    }
}

async function startTests() {
    console.log('--- STARTING PHASE 7 TESTS ---');
    const aReq = await axios.post(`${API}/auth/register`, { name: 'A', email: `testev_${Date.now()}@test.com`, password: 'Ev@123' });
    const bReq = await axios.post(`${API}/auth/register`, { name: 'B', email: `testev_b_${Date.now()}@test.com`, password: 'Ev@123' });
    const tokenA = aReq.data.token;
    const tokenB = bReq.data.token;

    // Complaint
    const comp = await axios.post(`${API}/complaints`, { crimeType: 'Phishing', language: 'English', incidentDate: new Date().toISOString(), originalDescription: 'Test Ev' }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const cid = comp.data._id;
    console.log(`[PASS] Complaint Generated: ${cid}`);

    // Create Dummy files
    const png64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const jpg64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const pdf64 = 'JVBERi0xLjEKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSPj4Kc3RyZWFtCgplbmRzdHJlYW0KZW5kb2JqCjMgMCBvYmoKMQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFJdPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAwL0tpZHNbXT4+CmVuZG9iago1IDAgb2JqCjw8L1Jvb3QgMSAwIFI+PgplbmRvYmoKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxMTkKJSVFT0YK';

    fs.writeFileSync('test1.png', Buffer.from(png64, 'base64'));
    fs.writeFileSync('test1.jpg', Buffer.from(jpg64, 'base64'));
    fs.writeFileSync('test1.pdf', Buffer.from(pdf64, 'base64'));
    fs.writeFileSync('test1.txt', 'Fake data');

    // 11MB file
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 'a');
    fs.writeFileSync('big.png', bigBuffer);

    let ev1Id;

    // Test Valid Uploads
    for (let f of [{ path: 'test1.png', type: 'image/png' }, { path: 'test1.jpg', type: 'image/jpeg' }, { path: 'test1.pdf', type: 'application/pdf' }]) {
        const form = new FormData();
        form.append('file', fs.createReadStream(f.path), { contentType: f.type, filename: f.path });
        const res = await logResult(`Upload ${f.path}`, axios.post(`${API}/evidence/${cid}`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${tokenA}` } }), true);
        if (res && f.path === 'test1.png') ev1Id = res.data._id;
    }

    // Invalid Tests
    const formTxt = new FormData();
    formTxt.append('file', fs.createReadStream('test1.txt'), { contentType: 'text/plain', filename: 'test1.txt' });
    await logResult(`Upload Invalid Type (txt)`, axios.post(`${API}/evidence/${cid}`, formTxt, { headers: { ...formTxt.getHeaders(), Authorization: `Bearer ${tokenA}` } }), false);

    const formBig = new FormData();
    formBig.append('file', fs.createReadStream('big.png'), { contentType: 'image/png', filename: 'big.png' });
    await logResult(`Upload 11MB File`, axios.post(`${API}/evidence/${cid}`, formBig, { headers: { ...formBig.getHeaders(), Authorization: `Bearer ${tokenA}` } }), false);

    // Hash verification
    if (ev1Id) {
        const formVerify = new FormData();
        formVerify.append('file', fs.createReadStream('test1.png'), { contentType: 'image/png', filename: 'test1.png' });
        await logResult(`Verify SHA-256 for test1.png`, axios.post(`${API}/evidence/verify/${ev1Id}`, formVerify, { headers: { ...formVerify.getHeaders(), Authorization: `Bearer ${tokenA}` } }), true);
    }

    // Unauthorized Access
    await logResult(`User B Fetches User A Vault`, axios.get(`${API}/evidence/${cid}`, { headers: { Authorization: `Bearer ${tokenB}` } }), false);
    if (ev1Id) {
        await logResult(`User B deletes User A Evidence`, axios.delete(`${API}/evidence/${ev1Id}`, { headers: { Authorization: `Bearer ${tokenB}` } }), false);
    }

    // List and Delete
    const vault = await logResult(`Fetch Evidence Vault for User A`, axios.get(`${API}/evidence/${cid}`, { headers: { Authorization: `Bearer ${tokenA}` } }), true);
    console.log(`[INFO] Elements in vault: ${vault?.data?.length}`);

    if (vault?.data?.length > 0) {
        console.log(`[INFO] Testing mass deletion of ${vault.data.length} cloud assets...`);
        for (let idx = 0; idx < vault.data.length; idx++) {
            await logResult(`Delete Asset [${vault.data[idx]._id}]`, axios.delete(`${API}/evidence/${vault.data[idx]._id}`, { headers: { Authorization: `Bearer ${tokenA}` } }), true);
        }
    }

    fs.unlinkSync('test1.png');
    fs.unlinkSync('test1.jpg');
    fs.unlinkSync('test1.pdf');
    fs.unlinkSync('test1.txt');
    fs.unlinkSync('big.png');
    console.log('--- DONE ---');
}

startTests();
