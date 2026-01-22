import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();

  const token = localStorage.getItem("token");

  const payload = useMemo(() => {
    if (!token) return null;
    return parseJwt(token);
  }, [token]);

  const isAdmin = payload?.role === "ADMIN";
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
      <h2>E-Commerce</h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/">Home</Link>

        {token && !isAdmin && (
          <Link to="/cart">
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        )}
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
