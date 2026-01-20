// Use relative path to leverage Vite proxy
const API_BASE = '/api';

export async function fetchPublic(endpoint) {
    try {
        const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

export async function postPublic(endpoint, data) {
    try {
        const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || `API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Post error:', error);
        throw error;
    }
}

export function getImageUrl(path) {
    if (!path) return '/placeholder.svg';
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    // Remove 'uploads/' prefix if present to avoid duplication
    if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.substring(8);
    }
    return `/uploads/${cleanPath}`;
}
