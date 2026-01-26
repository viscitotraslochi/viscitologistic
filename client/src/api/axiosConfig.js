// client/src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
    // Cerca l'URL nelle variabili d'ambiente, se non lo trova usa il localhost come fallback
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Opzionale: aggiungi un intercettore per il debug (utile per vedere se punta all'URL giusto)
api.interceptors.request.use(config => {
    console.log('Chiamata API inviata a:', config.baseURL);
    return config;
});

export default api;