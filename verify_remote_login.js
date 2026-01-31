const https = require('https');

const data = JSON.stringify({
    email: 'admin@rentlify.com',
    password: 'admin123'
});

const options = {
    hostname: 'rentlify-bankend-deployment.vercel.app',
    port: 443,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Attempting login to: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    let responseBody = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const json = JSON.parse(responseBody);
                console.log('✅ LOGIN SUCCESS!');
                console.log('User:', json.data.user.name);
                console.log('Role:', json.data.user.role);
                console.log('Token received:', !!json.data.tokens.access.token);
            } else {
                console.error('❌ LOGIN FAILED');
                console.error('Response:', responseBody);
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('Network Error:', error);
});

req.write(data);
req.end();
