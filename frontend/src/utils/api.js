import axios from 'axios';

const API_BASE = '/api';

export async function recognizeFlower(imageBase64) {
    const response = await axios.post(`${API_BASE}/recognize`, {
        image: imageBase64
    }, {
        timeout: 30000
    });
    return response.data;
}

export async function healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
}
