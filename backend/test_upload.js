const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    console.log('1. Registering user...');
    // Create random email to avoid collision
    const testEmail = `testuser_${Date.now()}@example.com`;
    const authRes = await axios.post('http://localhost:5000/auth/register', {
      email: testEmail,
      password: 'testpassword123'
    });
    
    const token = authRes.data.token;
    console.log(`✅ Registered user. Token received.`);

    console.log('2. Uploading invoice image...');
    const formData = new FormData();
    formData.append('invoice', fs.createReadStream('../python-ocr-service/data/raw/11885_20250227_page1.jpg'));

    const uploadRes = await axios.post('http://localhost:5000/invoice/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'x-auth-token': token
      }
    });

    console.log('✅ Upload successful. Response data:');
    console.log(uploadRes.data);
    
    console.log('3. Fetching all invoices for user...');
    const getAllRes = await axios.get('http://localhost:5000/invoice/all', {
      headers: { 'x-auth-token': token }
    });
    
    console.log(`✅ Retrieved ${getAllRes.data.length} invoices. Processing complete.`);

  } catch (err) {
    console.error('❌ Test failed:', err.response ? err.response.data : err.message);
  }
}

testUpload();
