import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // If using cookies in future
});

// Interceptor to inject Token & Club ID automatically
api.interceptors.request.use((config) => {
  // 1. Get Token from LocalStorage
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Get Active Club ID (if user selected one)
  const activeClubId = localStorage.getItem("activeClubId");
  if (activeClubId) {
    config.headers["x-club-id"] = activeClubId;
  }

  return config;
});

export default api;