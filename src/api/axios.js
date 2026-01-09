import axios from "axios";

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
  Promise.reject
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ FIX 1: Ignore 401s specifically from the login endpoint.
    // If we are logging in and get 401, it means "Wrong Password", not "Expired Token".
    if (originalRequest.url && originalRequest.url.includes("/login")) {
        return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      try {
        const res = await refreshApi.post("/auth/refresh-token", {
          token: refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logoutAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ FIX 2: ROBUST REDIRECT (Handles trailing slashes)
function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("activeClubId");

  // Remove trailing slashes and normalize to lowercase
  const currentPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();

  // Only redirect if we are NOT on the login page
  if (currentPath !== "/login") {
    window.location.href = "/login";
  }
}

export default api;