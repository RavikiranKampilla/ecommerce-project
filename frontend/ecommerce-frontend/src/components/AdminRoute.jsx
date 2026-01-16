import { isAuthenticated, getUserRole } from "../utils/auth";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Login Required</h2>
        <p>Please login as admin.</p>
      </div>
    );
  }

  if (getUserRole() !== "ADMIN") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>Admin access only.</p>
      </div>
    );
  }

  return children;
}
