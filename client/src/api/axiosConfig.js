// client/src/api/axiosConfig.js
import axios from 'axios';

// Crea un'istanza di axios con l'URL base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    // Vite leggerà automaticamente l'URL dal file .env
});

export default api;