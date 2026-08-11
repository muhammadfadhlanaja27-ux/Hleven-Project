import axios from 'axios';

// 1. Inisialisasi Axios dengan Base URL Backend Anda
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1', // Sesuaikan port jika backend Anda tidak di port 8000
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// 2. Request Interceptor: Menyisipkan Token secara otomatis
api.interceptors.request.use(
    (config) => {
        // Mengambil token dari localStorage yang disimpan saat Login
        const token = localStorage.getItem('token');
        
        // Jika token ada, sisipkan ke header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Menangani Token Expired (401) secara global
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Jika token tidak valid / kedaluwarsa, hapus data dan arahkan ke Login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect menggunakan window.location agar memicu hard reload
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;