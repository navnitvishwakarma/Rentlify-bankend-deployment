const axios = require('axios');

const API_URL = 'http://localhost:5001/api/v1';

const runTests = async () => {
    try {
        console.log('--- STARTING BACKEND TESTS ---');

        // 1. Health Check
        // Note: The root / is not under /api/v1 usually, let's check app.js
        // app.get('/', ...) is at root. 
        try {
            const health = await axios.get('http://localhost:5000/');
            console.log('✅ Health Check Passed:', health.data.message);
        } catch (e) {
            console.error('❌ Health Check Failed');
        }

        // 2. Register Customer
        const customerEmail = `test.customer.${Date.now()}@example.com`;
        let customerToken = '';
        console.log(`\nTesting Registration for: ${customerEmail}`);

        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Customer',
                email: customerEmail,
                password: 'password123',
                role: 'customer'
            });
            console.log('✅ Customer Registration Passed');
            customerToken = regRes.data.data.tokens.access.token;
        } catch (e) {
            console.error('❌ Registration Failed:', e.response?.data?.message || e.message);
            // If failed, try login if it exists
            if (e.response?.data?.message === 'Email already taken') {
                console.log('   (User exists, attempting login...)');
                const loginRes = await axios.post(`${API_URL}/auth/login`, {
                    email: customerEmail,
                    password: 'password123'
                });
                customerToken = loginRes.data.data.tokens.access.token;
                console.log('   (Login recovered token)');
                // console.log('   (Login recovered token)');
            }
        }

        // 3. Register Vendor
        const vendorEmail = `test.vendor.${Date.now()}@example.com`;
        let vendorToken = '';
        console.log(`Testing Vendor Registration...`);

        try {
            const vRegRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Vendor',
                email: vendorEmail,
                password: 'password123',
                role: 'vendor',
                businessName: 'Test Biz'
            });
            console.log('✅ Vendor Registration Passed');
            vendorToken = vRegRes.data.data.tokens.access.token;
        } catch (e) {
            console.error('❌ Vendor Registration Failed:');
            console.error('   Message:', e.response?.data?.message || e.message);
            console.error('   Status:', e.response?.status);
            console.error('   Data:', JSON.stringify(e.response?.data, null, 2));
        }

        // 4. Create Product (As Vendor)
        let productId = '';
        if (vendorToken) {
            console.log('\nTesting Product Creation...');
            try {
                const prodRes = await axios.post(`${API_URL}/products`, {
                    name: 'Test Camera',
                    description: 'A good camera',
                    category: 'electronics',
                    pricing: { daily: 100 },
                    totalQuantity: 10
                }, {
                    headers: { Authorization: `Bearer ${vendorToken}` }
                });
                console.log('✅ Product Creation Passed');
                productId = prodRes.data.data._id;
            } catch (e) {
                console.error('❌ Product Creation Failed:', e.response?.data?.message || e.message);
            }
        }

        // 5. Place Order (As Customer)
        if (customerToken && productId) {
            console.log('\nTesting Order Creation...');
            try {
                const orderRes = await axios.post(`${API_URL}/orders`, {
                    items: [{
                        product: productId,
                        quantity: 1,
                        startDate: new Date(Date.now() + 86400000).toISOString(), // T+1 day
                        endDate: new Date(Date.now() + 172800000).toISOString()   // T+2 days
                    }]
                }, {
                    headers: { Authorization: `Bearer ${customerToken}` }
                });
                console.log('✅ Order Creation Passed');
                console.log('   Order ID:', orderRes.data.data._id);
            } catch (e) {
                console.error('❌ Order Creation Failed:', e.response?.data?.message || e.message);
            }
        }

        console.log('\n--- TESTS COMPLETED ---');

    } catch (error) {
        console.error('Unexpected Test Error:', error.message);
    }
};

runTests();
