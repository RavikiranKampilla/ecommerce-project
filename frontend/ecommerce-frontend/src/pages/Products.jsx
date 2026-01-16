import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { toast } from "react-toastify";

export default function Products() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/products/category/${id}`)
      .then(res => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"));
  }, [id]);

  const addToCart = async (product) => {
    try {
      await api.post("/cart", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Added to cart");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add to cart");
      } else if (err.response?.status === 409) {
        toast.error("Out of stock");
      } else {
        toast.error("Unable to add to cart");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Products</h2>

        <div className="grid">
          {products.map(p => (
            <div key={p.id} className="card">
              <img src={p.imageUrl} alt={p.name} />
              <h3>{p.name}</h3>
              <p>₹{p.price}</p>

              {/* ✅ ONLY ADDITION */}
              <p style={{ color: "green", fontSize: "14px" }}>
                Only {p.stock} left
              </p>

              <button
                disabled={p.stock === 0}
                onClick={() => addToCart(p)}
              >
                {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
