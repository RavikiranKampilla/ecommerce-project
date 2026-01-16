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
      const res = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.text();
        setError(err || "Invalid email or password");
        return;
      }

      const token = (await res.text()).trim();
      localStorage.clear();
      localStorage.setItem("token", token);

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

          <button className="auth-btn" onClick={login}>
            Login
          </button>

          {/* error message */}
          {error && <p className="auth-error">{error}</p>}

          {/* ✅ ADDED: forgot password (UI only) */}
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
