// src/api/client.ts
import axios from 'axios';


const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
