import { API_BASE_URL } from '../../config/api';

async function authRequest(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error en la petición',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

export async function register(email, password, fullName) {
    return authRequest('/api/register', { email, password, full_name: fullName });
}

export async function login(email, password) {
    return authRequest('/api/login', { email, password });
}

