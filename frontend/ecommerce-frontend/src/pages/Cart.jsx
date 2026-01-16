import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const loadCart = async () => {
    const res = await api.get("/cart");
    setCart(res.data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ✅ INCREASE (BACKEND = SOURCE OF TRUTH)
  const increase = async (item) => {
    if (item.quantity >= item.stock) {
      alert("Max stock reached");
      return;
    }

    await api.put(`/cart/increase/${item.id}`);
    await loadCart();
  };

  // ✅ DECREASE (STOP AT 1)
  const decrease = async (id) => {
    const current = cart.find(i => i.id === id);
    if (!current || current.quantity <= 1) return;

    await api.put(`/cart/decrease/${id}`);
    await loadCart();
  };

  // ✅ REMOVE ITEM
  const remove = async (id) => {
    await api.delete(`/cart/${id}`);
    await loadCart();
  };

  // ✅ PROTECT AGAINST NaN
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
              {cart.map(item => (
                <div key={item.id} className="card">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={e =>
                      (e.target.src = "https://via.placeholder.com/300")
                    }
                  />

                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={() => decrease(item.id)}>-</button>
                    <strong>{item.quantity}</strong>
                    <button
                      onClick={() => increase(item)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  {item.quantity >= item.stock && (
                    <div style={{ color: "red", fontSize: 12 }}>
                      Max stock reached
                    </div>
                  )}

                  <button
                    style={{ background: "#ef4444", marginTop: 10 }}
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
              onClick={() => navigate("/checkout", { state: { cart } })}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </>
  );
}
