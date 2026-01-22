import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../api";

export default function Cart() {
  const { cart, loadCart } = useCart();
  const navigate = useNavigate();

  // Reload cart when component mounts (e.g., after returning from checkout)
  useEffect(() => {
    loadCart();
  }, []);

  // ✅ INCREASE (OPTIMISTIC)
  const increase = async (item) => {
    if (item.quantity >= item.stock) return;

    try {
      await api.put(`/cart/increase/${item.id}`);
      loadCart(); // Reload to sync with backend
    } catch {
      // API failed, reload to ensure sync
      loadCart();
    }
  };

  // ✅ DECREASE (OPTIMISTIC)
  const decrease = async (id) => {
    const current = cart.find((i) => i.id === id);
    if (!current || current.quantity <= 1) return;

    try {
      await api.put(`/cart/decrease/${id}`);
      loadCart(); // Reload to sync with backend
    } catch {
      loadCart();
    }
  };

  // ✅ REMOVE (OPTIMISTIC)
  const remove = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      loadCart(); // Reload to sync with backend
    } catch {
      loadCart();
    }
  };

  // Total
  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-state fade-in">
            <h3>Your cart is empty 🛒</h3>
            <p>Add items to your cart to see them here.</p>

            <button
              className="empty-btn"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        ) : (
          <>
            <div className="grid">
              {cart.map((item) => (
                <div key={item.id} className="card">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300")
                    }
                  />

                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <button onClick={() => decrease(item.id)}>
                      −
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={() => increase(item)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  {item.quantity >= item.stock && (
                    <div
                      style={{
                        color: "red",
                        fontSize: 12,
                      }}
                    >
                      Max stock reached
                    </div>
                  )}

                  <button
                    style={{
                      background: "#ef4444",
                      marginTop: 10,
                    }}
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 20 }}>
              Total: ₹{total}
            </h3>

            <button
              className="buy-btn"
              style={{ marginTop: 20 }}
              onClick={() =>
                navigate("/checkout", { state: { cart } })
              }
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </>
  );
}
