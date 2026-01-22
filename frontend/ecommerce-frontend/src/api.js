import axios from "axios";

// ✅ In-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute
const MIN_LOADING_DELAY = 500; // Minimum 500ms delay for loading states

const api = axios.create({
  baseURL: "https://ecommerce-project-7bi8.onrender.com",
});

// ✅ Request interceptor - Add token and track request start time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Track when request started for minimum delay
  config.metadata = { startTime: Date.now() };

  // Check cache for GET requests
  if (config.method === 'get') {
    const cacheKey = config.url;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached response with minimum delay to show loading states
      config.adapter = () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK (cached)',
            headers: cached.headers,
            config: config,
          });
        }, MIN_LOADING_DELAY);
      });
    }
  }

  return config;
});

// ✅ Response interceptor - Cache and enforce minimum delay
api.interceptors.response.use(
  async (res) => {
    // Cache GET responses
    if (res.config.method === 'get' && res.status === 200) {
      const cacheKey = res.config.url;
      cache.set(cacheKey, {
        data: res.data,
        headers: res.headers,
        timestamp: Date.now(),
      });
    }

    // Enforce minimum delay for all GET requests to show loading states
    if (res.config.method === 'get' && res.config.metadata?.startTime) {
      const elapsed = Date.now() - res.config.metadata.startTime;
      const remaining = MIN_LOADING_DELAY - elapsed;
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
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
