import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ❌ DO NOTHING ON 401
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
