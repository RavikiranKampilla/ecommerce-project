import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Categories from "./Categories";
import api from "../api";
import { toast } from "react-toastify";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null); // ✅ UX feedback

  // LOAD RECOMMENDED PRODUCTS
  useEffect(() => {
    api
      .get("/products/recommended")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"));
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
          {products.map((p) => (
            <div key={p.id} className="card">
              <img src={p.imageUrl} alt={p.name} />

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
          ))}
        </div>

        <h2 className="section-title" style={{ marginTop: 48 }}>
          Shop by Category
        </h2>

        <Categories />
      </div>
    </>
  );
}
