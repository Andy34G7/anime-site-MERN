import axios from "axios";

// Point client to our own server API
// Configure via Vite env: VITE_API_URL (e.g., http://localhost:5000/api)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 8000,
});

export default api;
