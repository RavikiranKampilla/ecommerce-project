import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, cartLoading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Helper functions using CartContext
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

  const remove = (itemId) => {
    removeFromCart(itemId);
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

        {cartLoading ? (
          <div className="empty-state fade-in">
            <h3>Loading cart...</h3>
          </div>
        ) : cart.length === 0 ? (
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
