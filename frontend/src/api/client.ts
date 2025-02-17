// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: window.__ENV__?.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
