import axios from "axios";
import NProgress from "nprogress";
// Ensure you import nprogress styles in main.jsx: import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ showSpinner: false, minimum: 0.1 });

// 🚨 SAFETY FIX: Do not default to localhost in production.
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("🚨 CRITICAL: VITE_API_URL is not defined!");
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let activeRequests = 0; // Track active requests to handle concurrent calls

const startLoading = () => {
    if (activeRequests === 0) NProgress.start();
    activeRequests++;
};

const stopLoading = () => {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        NProgress.done();
    }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    startLoading(); // START LOADER

    const accessToken = localStorage.getItem("accessToken");
    const activeClubId = localStorage.getItem("activeClubId");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (activeClubId) {
      config.headers["x-club-id"] = activeClubId;
    }
    return config;
  },
  (error) => {
    stopLoading(); // STOP LOADER ON ERROR
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    stopLoading(); // STOP LOADER
    return response;
  },
  async (error) => {
    stopLoading(); // STOP LOADER ON ERROR

    const originalRequest = error.config;

    // ... (Keep existing login 401 check logic)
    if (originalRequest.url && originalRequest.url.includes("/login")) {
        return Promise.reject(error);
    }

    // ... (Keep existing refresh token logic)
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Note: Refresh logic might trigger new requests, so NProgress will start again automatically via interceptor
        // ... (existing refresh logic)
        // Ensure you return api(originalRequest) which triggers the interceptor again
    }
    
    // ... (Keep existing refresh logic implementation details)
    // For brevity, assuming the rest of the file remains strictly the same as provided
    // but ensure existing refresh logic is preserved.
    
    // If logic falls through:
    return Promise.reject(error);
  }
);

// ... (Keep logoutAndRedirect function)

export default api;