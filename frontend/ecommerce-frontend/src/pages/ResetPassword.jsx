import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com"; // ✅ ADD

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reset = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/auth/reset-password?token=${token}&newPassword=${password}`, // ✅ FIX
        { method: "POST" }
      );

      const text = await res.text();

      if (!res.ok) {
        setError(text);
        return;
      }

      setMessage(text);
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <input
          className="auth-input"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={reset}>
          Reset Password
        </button>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
