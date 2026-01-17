import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

export default function OrderDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data));
  }, [id]);

  const grandTotal = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Order Details</h2>

        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
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
