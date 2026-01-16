import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders").then(res => setOrders(res.data));
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  const statusColor = (status) => {
    if (status === "PLACED") return "#f59e0b";
    if (status === "DELIVERED") return "#16a34a";
    if (status === "CANCELLED") return "#dc2626";
    return "gray";
  };

  const cancelOrder = (orderId) => {
    api.put(`/orders/${orderId}/cancel`)
      .then(() => {
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId
              ? { ...o, status: "CANCELLED" }
              : o
          )
        );

        setToast("Order cancelled");
        setTimeout(() => setToast(""), 2500);
      });
  };

  return (
    <>
      <Navbar />
      {toast && <div className="toast-top">{toast}</div>}

      <div className="container">
        <h2 className="section-title">My Orders</h2>

        {orders.length === 0 ? (
          /* ✅ ONLY UPDATED EMPTY STATE */
          <div className="empty-state fade-in">
            <h3>No orders yet 📦</h3>
            <p>Your orders will appear here after checkout.</p>

            <button
              className="empty-btn"
              onClick={() => navigate("/")}
            >
              Shop from Home
            </button>
          </div>
        ) : (
          <div className="grid">
            {orders.map(order => (
              <div
                key={order.id}
                className="card"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <h3>Order #{order.id}</h3>
                <p>Date: {formatDate(order.createdAt)}</p>
                <p>Total: ₹{order.totalAmount}</p>

                <p>
                  Status:{" "}
                  <strong style={{ color: statusColor(order.status) }}>
                    {order.status}
                  </strong>
                </p>

                {order.status === "PLACED" && (
                  <button
                    className="cancel-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelOrder(order.id);
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
