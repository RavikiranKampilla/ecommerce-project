import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      {/* 🔹 ADDED: Top bar */}
      <div className="auth-top">
        <button className="auth-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="auth-title">E-Commerce</h1>
      </div>

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

        {/* 🔹 ADDED: Forgot password */}
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
