import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Categories from "./Categories";
import api from "../api";
import { toast } from "react-toastify";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null); // ✅ UX feedback
  const [loading, setLoading] = useState(true); // ✅ Track loading state

  // LOAD RECOMMENDED PRODUCTS
  useEffect(() => {
    setLoading(true);
    api
      .get("/products/recommended")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load products");
        setLoading(false);
      });
  }, []);

  // ADD TO CART (FAST FEEL)
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }

    // ⚡ INSTANT CLICK FEEDBACK
    setAddingId(product.id);

    try {
      await api.post("/cart", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Added to cart");
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        toast.error("Please login to add to cart");
      } else if (status === 400 || status === 409) {
        toast.error("Out of stock");
      } else {
        toast.error("Unable to add to cart");
      }
    } finally {
      setAddingId(null); // reset button
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Recommended Products</h2>

        <div className="grid">
          {loading ? (
            // Show skeleton cards while loading
            [...Array(8)].map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-stock"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            ))
          ) : products.length === 0 ? (
            <p>No products available</p>
          ) : (
            // Show real products after successful load
            products.map((p) => (
              <div key={p.id} className="card">
                <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />

                <h4>{p.name}</h4>
                <div className="price">₹{p.price}</div>

                {p.stock === 0 ? (
                  <div style={{ color: "red", fontSize: 14 }}>
                    Out of Stock
                  </div>
                ) : (
                  <div style={{ color: "green", fontSize: 14 }}>
                    Only {p.stock} left
                  </div>
                )}

                {p.stock === 0 ? (
                  <button disabled>Out of Stock</button>
                ) : (
                  <button
                    onClick={() => addToCart(p)}
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
