import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { logout } = useAuth();

  const token = localStorage.getItem("token");

  const payload = useMemo(() => {
    if (!token) return null;
    return parseJwt(token);
  }, [token]);

  const isAdmin = payload?.role === "ADMIN";

  const handleLogout = () => {
    clearCart();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* Clickable Brand → Home */}
      <h2
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        E-Commerce
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/">Home</Link>

        {token && !isAdmin && <Link to="/cart">Cart</Link>}
        {token && !isAdmin && <Link to="/orders">Orders</Link>}
        {token && isAdmin && <Link to="/admin/orders">Admin Orders</Link>}

        {!token ? (
          <Link to="/login">Login</Link>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
