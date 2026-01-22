import axios from "axios";

// ✅ In-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute
const MIN_LOADING_DELAY = 500; // Minimum 500ms delay for loading states

const api = axios.create({
  baseURL: "https://ecommerce-project-7bi8.onrender.com",
});

// ❌ DO NOT cache user-specific endpoints
const NO_CACHE_ENDPOINTS = ["/cart", "/orders"];

// Helper
const shouldCache = (url) =>
  !NO_CACHE_ENDPOINTS.some((path) => url.startsWith(path));

// ✅ Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.metadata = { startTime: Date.now() };

  // ✅ Cache ONLY non-user GET requests
  if (config.method === "get" && shouldCache(config.url)) {
    const cacheKey = config.url;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      config.adapter = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: cached.data,
              status: 200,
              statusText: "OK (cached)",
              headers: cached.headers,
              config,
            });
          }, MIN_LOADING_DELAY);
        });
    }
  }

  return config;
});

// ✅ Response interceptor
api.interceptors.response.use(
  (res) => {
    if (
      res.config.method === "get" &&
      res.status === 200 &&
      shouldCache(res.config.url)
    ) {
      cache.set(res.config.url, {
        data: res.data,
        headers: res.headers,
        timestamp: Date.now(),
      });
    }

    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      cache.clear(); // 🔥 clear cache on auth failure
    }
    return Promise.reject(err);
  }
);

// ✅ Clear cache manually (use after cart mutations if needed)
export const clearCache = () => cache.clear();

// ✅ Keep backend alive (cold start prevention)
if (typeof window !== "undefined") {
  const keepAlive = () => {
    fetch("https://ecommerce-project-7bi8.onrender.com/health").catch(() => {});
  };

  keepAlive();
  setInterval(keepAlive, 600000); // every 10 min
}

export default api;
