import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cart,
    cartLoading,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  const increase = (item) => {
    if (item.quantity < item.stock) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const decrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const total = cart.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0);
  }, 0);

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Your Cart</h2>

        {cartLoading ? (
          <p>Loading cart...</p>
        ) : cart.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty 🛒</h3>
            <button onClick={() => navigate("/")}>
              Go to Home
            </button>
          </div>
        ) : (
          <>
            <div className="grid">
              {cart.map((item) => {
                return (
                  <div key={item.id} className="card">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                    />

                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => decrease(item)}>
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

                    <button
                      style={{ background: "#ef4444", marginTop: 10 }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <h3>Total: ₹{total}</h3>

            <button
              className="buy-btn"
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
