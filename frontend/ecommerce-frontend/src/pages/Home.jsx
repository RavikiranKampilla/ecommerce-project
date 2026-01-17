import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Categories from "./Categories";
import api from "../api";
import { toast } from "react-toastify";

export default function Home() {
  const [products, setProducts] = useState([]);

  // ✅ LOAD RECOMMENDED PRODUCTS (BACKEND CONTROLLED)
  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  // ✅ ADD TO CART
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }

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
      } else if (status === 400) {
        toast.error("Out of stock");
      } else if (status === 404) {
        toast.error("Product not found");
      } else {
        toast.error("Unable to add to cart");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 className="section-title">Recommended Products</h2>

        <div className="grid">
          {products.map(p => (
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

              {/* ✅ FIX: NO onClick when OUT OF STOCK */}
              {p.stock === 0 ? (
                <button disabled>
                  Out of Stock
                </button>
              ) : (
                <button onClick={() => addToCart(p)}>
                  Add to Cart
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
