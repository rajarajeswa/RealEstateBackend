/**
 * Base API URL. In dev use backend on port 5000.
 * Set VITE_API_URL in .env for production (e.g. https://your-api.com).
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetch and parse JSON. If the server returns HTML (e.g. 404 page or SPA index),
 * throws a clear error instead of "Unexpected token '<'".
 */
export async function apiFetch(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
    const isJsonBody = options.body && typeof options.body === 'string';
    const headers = {
        ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
    };
    let res;
    try {
        res = await fetch(fullUrl, { ...options, headers });
    } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            throw new Error(`Cannot reach backend at ${API_BASE}. Start it with: cd backend && npm start`);
        }
        throw e;
    }
    const text = await res.text();
    if (text.trimStart().startsWith('<')) {
        throw new Error(
            `Backend at ${API_BASE} returned HTML instead of JSON. Is the backend running? Start it with: cd backend && npm start`
        );
    }
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error('Invalid JSON from server.');
    }
    return { response: res, data };
}

export const apiBase = () => API_BASE;
