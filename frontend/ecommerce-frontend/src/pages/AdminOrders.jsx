import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/admin")
      .then(res => setOrders(res.data))
      .catch(err => {
        console.error(err);
        alert("Failed to load admin orders");
      });
  }, []);

  const updateStatus = (id, status) => {
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, status } : o)
    );
  };

  const shipOrder = (id) => {
    api.put(`/orders/admin/${id}/ship`)
      .then(() => updateStatus(id, "SHIPPED"))
      .catch(() => alert("Ship failed"));
  };

  const deliverOrder = (id) => {
    api.put(`/orders/admin/${id}/deliver`)
      .then(() => updateStatus(id, "DELIVERED"))
      .catch(() => alert("Delivery failed"));
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Admin Orders</h2>

        {orders.length === 0 ? (
          <p>No orders</p>
        ) : (
          <div className="grid">
            {orders.map(o => (
              <div key={o.id} className="card">
                <h3>Order #{o.id}</h3>
                <p>User: {o.userEmail}</p>
                <p>Total: ₹{o.totalAmount}</p>
                <p>Status: {o.status}</p>

                {o.status === "PLACED" && (
                  <button onClick={() => shipOrder(o.id)}>
                    Mark as Shipped
                  </button>
                )}

                {o.status === "SHIPPED" && (
                  <button onClick={() => deliverOrder(o.id)}>
                    Mark as Delivered
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
