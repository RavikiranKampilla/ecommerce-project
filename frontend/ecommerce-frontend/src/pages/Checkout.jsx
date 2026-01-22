import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import api from "../api";
import { useState } from "react";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [placing, setPlacing] = useState(false);

  // Case 1: Buy Now (single product)
  const singleProduct = state?.product;

  // Case 2: Cart checkout (multiple products)
  const cartItems = state?.cart || [];

  const items = singleProduct ? [singleProduct] : cartItems;

  // ✅ Fix: multiply price by quantity
  const total = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>No items to checkout.</p>
        </div>
      </>
    );
  }

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      await api.post("/orders");
      toast.success("Order placed successfully 🎉");

      // Cart is already cleared by backend
      clearCart();
      navigate("/order-success");
    } catch (err) {
      toast.error(err.response?.data || "Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Checkout</h2>

        <div className="grid">
          {items.map((item, index) => (
            <div key={item.id || index} className="card">
              <img
                src={item.imageUrl}
                alt={item.name}
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/300")
                }
              />
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
              {item.quantity && <p>Quantity: {item.quantity}</p>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px" }}>
          <h3>Total Amount: ₹{total.toFixed(2)}</h3>

          <button
            className="buy-btn"
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? "Placing Order..." : `Pay ₹${total.toFixed(2)}`}
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#6b7280",
              marginTop: "10px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
