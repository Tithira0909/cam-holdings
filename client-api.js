const API_BASE = 'http://localhost:3000/api';

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

export function getImageUrl(path) {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    // Ensure path uses forward slashes
    const cleanPath = path.replace(/\\/g, '/');
    // If path already starts with uploads/, we prepend base.
    // If path starts with backend/uploads/, strip backend/.
    // Usually it is uploads/filename.
    return `http://localhost:3000/${cleanPath}`;
}
