import { API_BASE_URL } from '../../config/api';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function getNotes() {
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error al obtener notas',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

export async function createNote(title, content) {
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error al crear nota',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

export async function updateNote(id, title, content) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error al actualizar nota',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteNote(id) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error al eliminar nota',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

export async function restoreNote(id) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}/restore`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'Error al restaurar nota',
        }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    return response.json();
}

