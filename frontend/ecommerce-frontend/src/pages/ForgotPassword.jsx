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
        `${API_BASE}/auth/forgot-password?email=${email}`,
        { method: "POST" }
      );

      const text = await res.text();

      // ✅ CLEAN ERROR HANDLING
      if (!res.ok) {
        try {
          const errObj = JSON.parse(text);
          setError(errObj.error || "Unable to send reset link");
        } catch {
          setError("Unable to send reset link");
        }
        return;
      }

      setMessage(text || "Reset link sent successfully");
    } catch {
      setError("Server not reachable");
    }
  };

  return (
    <div className="auth-page">
      {/* ⬅ Back button (top-left) */}
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
