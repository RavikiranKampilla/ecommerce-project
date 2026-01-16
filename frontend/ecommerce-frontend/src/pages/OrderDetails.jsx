import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

export default function OrderDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data))
      .catch(() => setError("Failed to load order items"))
      .finally(() => setLoading(false));
  }, [id]);

  const grandTotal = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">
          Order Details (#{id})
        </h2>

        {loading && <p>Loading...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p>No items found</p>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid">
              {items.map((item, index) => (
                <div key={index} className="card">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={e =>
                      (e.target.src =
                        "https://via.placeholder.com/300")
                    }
                  />

                  <h3>{item.name}</h3>
                  <p>Price: ₹{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <strong>Total: ₹{item.total}</strong>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: "20px" }}>
              Grand Total: ₹{grandTotal}
            </h3>
          </>
        )}
      </div>
    </>
  );
}
