// Test Status Toggle
// Run with: node test_toggle_status.js

const BASE_URL = 'http://localhost:3000/api';
let token = '';

async function runTests() {
    console.log('--- Starting Status Toggle Tests ---');

    // 1. Login to get token
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });
        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('✓ Login Successful');
    } catch (e) {
        console.error('Login Failed:', e.message);
        return;
    }

    // 2. Create a Dummy Property
    let propId;
    try {
        const res = await fetch(`${BASE_URL}/admin/properties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Toggle Test Property ' + Date.now(),
                location: 'Test Location',
                price: '$100',
                description: 'Test',
                status: 'Inactive',
                category: 'Villa',
                tags: 'Test',
                service_category: 'Real Estate'
            })
        });
        const data = await res.json();
        if(res.ok) {
            propId = data.id;
            console.log('✓ Created Inactive Property (ID: ' + propId + ')');
        } else {
            throw new Error('Create failed: ' + JSON.stringify(data));
        }
    } catch(e) { console.error(e); return; }

    // 3. Toggle to Active
    try {
        const res = await fetch(`${BASE_URL}/properties/${propId}/toggle-status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok && data.status === 'Active') {
            console.log('✓ Toggled to Active');
        } else {
            console.error('✗ Toggle to Active Failed', data);
        }
    } catch(e) { console.error(e); }

    // 4. Toggle back to Inactive
    try {
        const res = await fetch(`${BASE_URL}/properties/${propId}/toggle-status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok && data.status === 'Inactive') {
            console.log('✓ Toggled to Inactive');
        } else {
            console.error('✗ Toggle to Inactive Failed', data);
        }
    } catch(e) { console.error(e); }

    // Cleanup
    try {
        await fetch(`${BASE_URL}/admin/properties/${propId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✓ Cleanup (Delete) Successful');
    } catch(e) {}
}

runTests();
