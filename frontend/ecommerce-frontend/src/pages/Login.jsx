import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    setError("");
    try {
      const res = await fetch(
        "https://<YOUR-BACKEND-URL>/auth/login", // ✅ USE DEPLOYED BACKEND URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json(); // ✅ CHANGED (was res.text())

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }

      // ✅ CHANGED: extract token from JSON
      localStorage.clear();
      localStorage.setItem("token", data.token);

      navigate("/", { replace: true });
    } catch (err) {
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

          <button className="auth-btn" onClick={login}>
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
