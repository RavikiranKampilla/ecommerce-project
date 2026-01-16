import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token.trim();
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
};

export const isAdmin = () => getUserRole() === "ADMIN";

export const logout = () => {
  localStorage.clear();
};
