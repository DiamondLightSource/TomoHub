// src/api/client.ts
import axios from 'axios';

// Debugging: Log API URL from config.js
console.log("API Base URL:", window.__ENV__?.VITE_API_BASE_URL);

const apiClient = axios.create({
  baseURL: window.__ENV__.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
