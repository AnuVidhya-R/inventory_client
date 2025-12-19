const API_BASE_URL = 'https://inventory-server-12od.onrender.com/inventix';

const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    });
    return response.json();
};

export const api = {
    post: (endpoint, data) => apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    get: (endpoint) => apiCall(endpoint),
    put: (endpoint, data) => apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (endpoint) => apiCall(endpoint, {
        method: 'DELETE'
    })
};