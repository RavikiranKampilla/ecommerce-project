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
  const { login: authLogin } = useAuth();

  const login = async () => {
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const errObj = JSON.parse(text);
          setError(errObj.error || "Invalid email or password");
        } catch {
          setError(text || "Invalid email or password");
        }
        return;
      }

      const data = JSON.parse(text);
      authLogin(data.token);
      navigate("/", { replace: true });
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button className="auth-back" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="auth-brand">E-Commerce</div>

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

        <div className="auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button className="auth-btn" onClick={login}>
          Login
        </button>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-switch">
          New user? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
