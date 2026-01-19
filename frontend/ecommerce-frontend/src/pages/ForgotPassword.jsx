import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",   // ✅ REQUIRED
          },
          body: JSON.stringify({ email }),        // ✅ CRITICAL FIX
        }
      );

      const text = await res.text();

      if (!res.ok) {
        setError(text || "Unable to send reset link");
        return;
      }

      setMessage(text || "If the email exists, a reset link has been sent");
    } catch {
      setError("Server not reachable");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button className="auth-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your registered email</p>

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="auth-btn" onClick={submit}>
          Send Reset Link
        </button>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;
