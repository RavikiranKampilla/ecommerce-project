import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { getToken } from "../utils/auth";

export default function Products() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/category/${id}`)
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ ADD TO CART - Check token directly for immediate auth
  const handleAddToCart = async (product) => {
    // ✅ Check token DIRECTLY - avoids stale React state after login
    if (!getToken()) {
      toast.error("Please login to add to cart");
      return;
    }

    setAddingId(product.id);

    try {
      await addToCart(product, 1);
      toast.success("Added to cart");
    } catch (err) {
      if (err.message === "LOGIN_REQUIRED") {
        toast.error("Please login to add to cart");
      } else {
        toast.error("Unable to add to cart");
      }
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Products</h2>

        <div className="grid">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton skeleton-image" />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-price" />
                <div className="skeleton skeleton-stock" />
                <div className="skeleton skeleton-button" />
              </div>
            ))
          ) : (
            products.map((p) => (
              <div key={p.id} className="card">
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
                <h3>{p.name}</h3>
                <p>₹{p.price}</p>

                {p.stock === 0 ? (
                  <button disabled>Out of Stock</button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={addingId === p.id}
                  >
                    {addingId === p.id ? "Adding..." : "Add to Cart"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
