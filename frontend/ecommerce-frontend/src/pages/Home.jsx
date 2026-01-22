import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Categories from "./Categories";
import api from "../api";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { getToken } from "../utils/auth";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  // LOAD RECOMMENDED PRODUCTS
  useEffect(() => {
    setLoading(true);
    api
      .get("/products/recommended")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

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
        <h2 className="section-title">Recommended Products</h2>

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
          ) : products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="card">
                <img src={p.imageUrl} alt={p.name} loading="lazy" />

                <h4>{p.name}</h4>
                <div className="price">₹{p.price}</div>

                {p.stock === 0 ? (
                  <div style={{ color: "red" }}>Out of Stock</div>
                ) : (
                  <div style={{ color: "green" }}>
                    Only {p.stock} left
                  </div>
                )}

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

        <h2 className="section-title" style={{ marginTop: 48 }}>
          Shop by Category
        </h2>

        <Categories />
      </div>
    </>
  );
}
