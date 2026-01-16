import { isAuthenticated } from "../utils/auth";
import { Link, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Login Required</h2>
        <p>You must login to access this page.</p>
        <Link to="/login" state={{ from: location.pathname }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return children;
}
