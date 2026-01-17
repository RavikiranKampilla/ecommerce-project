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

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

      // ✅ GO TO HOME
      navigate("/", { replace: true });
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
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
          New user? <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
