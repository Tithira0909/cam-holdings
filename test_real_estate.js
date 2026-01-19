// Test Script for Real Estate API
// Run with: node test_real_estate.js

const BASE_URL = 'http://localhost:3000/api';
let token = '';

async function runTests() {
    console.log('--- Starting Real Estate API Tests ---');

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
        if (!token) throw new Error('No token received');
        console.log('✓ Login Successful');
    } catch (e) {
        console.error('Login Failed:', e.message);
        console.log('Skipping remaining tests due to login failure.');
        return;
    }

    // 2. Create Property (JSON fallback, assuming backend handles it or multipart boundary is tricky in node without lib)
    let propId;
    try {
        // Note: Backend expects multipart/form-data generally, but we try JSON for simplicity of test script.
        // If backend strict on multipart, this might fail without 'form-data' package.
        // But let's try.
        const res = await fetch(`${BASE_URL}/admin/real-estate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Test Property ' + Date.now(),
                location: 'Test Location',
                price: '$1,000,000',
                description: 'Test Description',
                status: 'Active',
                category: 'Villa',
                tags: 'Luxury,Pool'
            })
        });

        const data = await res.json();
        if (res.ok) {
            propId = data.id;
            console.log('✓ Create Property Successful (ID: ' + propId + ')');
        } else {
            console.error('✗ Create Property Failed', data);
        }
    } catch (e) {
        console.error('Create Error:', e);
    }

    if (!propId) return;

    // 3. List Admin Properties
    try {
        const res = await fetch(`${BASE_URL}/admin/real-estate`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.find(p => p.id === propId)) {
            console.log('✓ Admin List Verified');
        } else {
            console.error('✗ Property not found in Admin List');
        }
    } catch(e) { console.error(e); }

    // 4. List Public Properties
    try {
        const res = await fetch(`${BASE_URL}/real-estate`);
        const data = await res.json();
        if (Array.isArray(data) && data.find(p => p.id === propId)) {
            console.log('✓ Public List Verified');
        } else {
            console.error('✗ Property not found in Public List');
        }
    } catch(e) { console.error(e); }

    // 5. Update Status
    try {
        const res = await fetch(`${BASE_URL}/admin/real-estate/${propId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Inactive' })
        });
        if (res.ok) console.log('✓ Status Update Verified');
        else console.error('✗ Status Update Failed');
    } catch(e) { console.error(e); }

    // 6. Delete Property
    try {
        const res = await fetch(`${BASE_URL}/admin/real-estate/${propId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) console.log('✓ Delete Verified');
        else console.error('✗ Delete Failed');
    } catch(e) { console.error(e); }
}

runTests();
