import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE = "https://ecommerce-project-7bi8.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ UX

  const navigate = useNavigate();

  const submit = async () => {
    if (loading) return;

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text || "Unable to send reset link");
        setLoading(false);
        return;
      }

      setMessage(
        text || "If the email exists, a reset link has been sent"
      );
      setLoading(false);
    } catch {
      setError("Server not reachable");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button
          className="auth-back"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
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
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="auth-btn"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;
