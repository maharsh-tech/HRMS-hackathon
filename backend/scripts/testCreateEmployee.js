// Test employee creation on Vercel
const https = require('https');

// First get the token (we already logged in)
const loginData = JSON.stringify({
    employeeId: 'admin@gmail.com',
    password: 'admin'
});

const loginOptions = {
    hostname: 'dayflow-brown.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const loginReq = https.request(loginOptions, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const loginResponse = JSON.parse(body);
        if (!loginResponse.token) {
            console.log('Login failed:', body);
            return;
        }
        console.log('Login successful, got token');

        // Now create employee
        const employeeData = JSON.stringify({
            firstName: 'Test',
            lastName: 'Employee',
            email: 'test@example.com',
            role: 'employee'
        });

        const createOptions = {
            hostname: 'dayflow-brown.vercel.app',
            port: 443,
            path: '/api/employees/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResponse.token}`,
                'Content-Length': employeeData.length
            }
        };

        const createReq = https.request(createOptions, (res2) => {
            let body2 = '';
            res2.on('data', chunk => body2 += chunk);
            res2.on('end', () => {
                console.log('Create Employee Status:', res2.statusCode);
                console.log('Response:', body2);
            });
        });

        createReq.on('error', (e) => console.error('Create Error:', e.message));
        createReq.write(employeeData);
        createReq.end();
    });
});

loginReq.on('error', (e) => console.error('Login Error:', e.message));
loginReq.write(loginData);
loginReq.end();
