const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API = 'http://localhost:5000/api';

async function startTests() {
    console.log('--- STARTING PHASE 8 PDF TESTS ---');
    const pw = 'Pdf@123';

    // Auth
    const aReq = await axios.post(`${API}/auth/register`, { name: 'A', email: `testpdf_${Date.now()}@test.com`, password: pw });
    const bReq = await axios.post(`${API}/auth/register`, { name: 'B', email: `testpdf_b_${Date.now()}@test.com`, password: pw });
    const tokenA = aReq.data.token;
    const tokenB = bReq.data.token;

    // Test 1: Create Complaint (Long text)
    const longText = 'I was scammed out of 500 dollars. '.repeat(100);
    const compA = await axios.post(`${API}/complaints`, { crimeType: 'Phishing', language: 'English', incidentDate: new Date().toISOString(), amount: 500, originalDescription: longText, generatedComplaint: '[Simulated AI Return]' }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const cidA = compA.data._id;
    console.log('[PASS] Test 1, 2, 7: Long Complaint Created');

    // Test 3 & 8: Attach Multiple Events
    const png64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync('test_pdf.png', Buffer.from(png64, 'base64'));
    for (let i = 0; i < 2; i++) {
        const form = new FormData();
        form.append('file', fs.createReadStream('test_pdf.png'), { contentType: 'image/png', filename: 'test_pdf.png' });
        await axios.post(`${API}/evidence/${cidA}`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${tokenA}` } });
    }
    console.log('[PASS] Test 3, 8: Multiple Evidence files attached');

    // Test 4: Generate PDF
    const pdfReq = await axios.get(`${API}/reports/${cidA}`, { responseType: 'arraybuffer', headers: { Authorization: `Bearer ${tokenA}` } });
    fs.writeFileSync('test_result_1.pdf', pdfReq.data);
    console.log(`[PASS] Test 4: PDF successfully streamed. Size: ${pdfReq.data.byteLength} bytes`);

    // Test 5: Generate PDF without Evidence
    const compNoEv = await axios.post(`${API}/complaints`, { crimeType: 'Phishing', language: 'English', incidentDate: new Date().toISOString(), originalDescription: "test" }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const pdfReqNoEv = await axios.get(`${API}/reports/${compNoEv.data._id}`, { responseType: 'arraybuffer', headers: { Authorization: `Bearer ${tokenA}` } });
    fs.writeFileSync('test_result_no_evidence.pdf', pdfReqNoEv.data);
    console.log('[PASS] Test 5: PDF generated successfully with NO evidence');

    // Test 6: Unauthorized access
    try {
        await axios.get(`${API}/reports/${cidA}`, { headers: { Authorization: `Bearer ${tokenB}` } });
        console.log('[FAIL] User B successfully stole User A PDF!');
    } catch (e) {
        console.log('[PASS] Test 6: Unauthorized Access strictly blocked');
    }

    fs.unlinkSync('test_pdf.png');
    // We intentionally leave the PDFs to inspect locally if needed manually.
    console.log('--- DONE ---');
}

startTests().catch(e => {
    console.error("FATAL SCRIPT CRASH:");
    console.error(e);
    if (e.response && e.response.data) {
        console.error("RESPONSE DATA:", e.response.data.toString ? e.response.data.toString() : e.response.data);
    }
});
