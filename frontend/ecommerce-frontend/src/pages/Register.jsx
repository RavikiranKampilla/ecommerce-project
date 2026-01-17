import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const register = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const token = await res.text();

      if (!res.ok) {
        setError(token || "Registration failed");
        return;
      }

      // ✅ AUTO LOGIN (GLOBAL STATE)
      login(token.trim());
      navigate("/", { replace: true });
    } catch {
      setError("Backend not reachable");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          className="auth-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="auth-input"
          type="email"
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

        <button className="auth-btn" onClick={register}>
          Register
        </button>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
