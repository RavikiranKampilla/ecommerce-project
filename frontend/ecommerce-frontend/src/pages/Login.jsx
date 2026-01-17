import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }

      // ✅ GLOBAL LOGIN
      login(data.token);
      navigate("/", { replace: true });
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-brand">E-Commerce</h1>

        <div className="auth-card">
          <h2>Welcome Back</h2>

          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>

          {error && <p className="auth-error">{error}</p>}

          <div className="auth-switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <div className="auth-switch">
            New user? <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
