import axios from "axios";

// ✅ In-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

const api = axios.create({
  baseURL: "https://ecommerce-project-7bi8.onrender.com",
});

// ✅ Request interceptor - Check cache before making request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check cache for GET requests
  if (config.method === 'get') {
    const cacheKey = config.url;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached response without making network request
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (cached)',
        headers: cached.headers,
        config: config,
      });
    }
  }

  return config;
});

// ✅ Response interceptor - Cache successful GET responses
api.interceptors.response.use(
  (res) => {
    // Cache GET responses
    if (res.config.method === 'get' && res.status === 200) {
      const cacheKey = res.config.url;
      cache.set(cacheKey, {
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
    }
    return Promise.reject(err);
  }
);

// ✅ Clear cache when user logs out
export const clearCache = () => cache.clear();

// ✅ Keep backend alive - Ping every 10 minutes to prevent cold starts
if (typeof window !== 'undefined') {
  const keepAlive = () => {
    fetch('https://ecommerce-project-7bi8.onrender.com/health')
      .catch(() => {}); // Ignore errors
  };

  // Ping on load
  keepAlive();

  // Ping every 10 minutes
  setInterval(keepAlive, 600000);
}

export default api;
