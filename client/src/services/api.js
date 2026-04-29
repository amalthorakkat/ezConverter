import axios from "axios";

// Create a centralized Axios instance
const api = axios.create({
  // Adjust this to match your actual backend URL/port
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
