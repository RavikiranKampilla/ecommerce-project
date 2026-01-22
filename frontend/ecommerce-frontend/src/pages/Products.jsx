import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { toast } from "react-toastify";

export default function Products() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null); // ✅ instant feedback
  const [loading, setLoading] = useState(true); // ✅ Track loading state

  useEffect(() => {
    setLoading(true);
    api.get(`/products/category/${id}`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load products");
        setLoading(false);
      });
  }, [id]);

  // ⚡ FAST + SAFE ADD TO CART
  const addToCart = async (product) => {
    // instant click feedback
    setAddingId(product.id);

    try {
      await api.post("/cart", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Added to cart");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add to cart");
      } else if (err.response?.status === 400 || err.response?.status === 409) {
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
        <h2>Products</h2>

        <div className="grid">
          {loading || products.length === 0 ? (
            // Show skeleton cards while loading or no products
            [...Array(8)].map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-stock"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            ))
          ) : (
            // Show real products after successful load
            products.map(p => (
              <div key={p.id} className="card">
                <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />
                <h3>{p.name}</h3>
                <p>₹{p.price}</p>

                <p style={{ color: "green", fontSize: "14px" }}>
                  Only {p.stock} left
                </p>

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
      </div>
    </>
  );
}
