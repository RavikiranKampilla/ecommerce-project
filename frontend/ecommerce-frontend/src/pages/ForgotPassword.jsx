import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ ADDED

  const submit = async () => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8081/auth/forgot-password?email=${email}`,
        { method: "POST" }
      );

      const text = await res.text();

      if (!res.ok) {
        setError(text);
        return;
      }

      setMessage(text);
    } catch {
      setError("Server not reachable");
    }
  };

  return (
    <div className="auth-page">
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

        {/* ✅ BACK NAVIGATION (ONLY ADDITION) */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            className="auth-link"
            onClick={() => navigate("/login")}
          >
            ← Back to Login
          </button>

          <br />

          <button
            className="auth-link"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
