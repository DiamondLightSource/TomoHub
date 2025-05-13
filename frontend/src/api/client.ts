// src/api/client.ts
import axios from 'axios';


const apiClient = axios.create({
  // for deploy
  baseURL: window.__ENV__.VITE_API_BASE_URL,
  // baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
