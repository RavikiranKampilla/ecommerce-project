import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import api from "../api";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart, loadCart } = useCart();

  // Case 1: Buy Now (single product)
  const singleProduct = state?.product;

  // Case 2: Cart checkout (multiple products)
  const cartItems = state?.cart || [];

  const items = singleProduct ? [singleProduct] : cartItems;

  const total = items.reduce((sum, item) => sum + item.price, 0);

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
    try {
      // 🔥 REAL BACKEND CALL (DB WILL CHANGE)
      await api.post("/orders");

      toast.success("Order placed successfully 🎉");

      // Clear cart and reload to sync with backend
      await clearCart();
      await loadCart();

      navigate("/order-success");
    } catch (err) {
      toast.error("Order failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Checkout</h2>

        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.imageUrl}
                alt={item.name}
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/300")
                }
              />
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px" }}>
          <h3>Total Amount: ₹{total}</h3>

          <button className="buy-btn" onClick={placeOrder}>
            Pay ₹{total}
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
