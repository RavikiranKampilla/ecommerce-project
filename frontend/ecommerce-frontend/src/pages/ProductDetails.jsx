import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      const all = res.data;
      const selected = all.find(p => p.id === Number(id));

      setProduct(selected);

      if (selected) {
        setRecommended(
          all.filter(
            p =>
              p.category.id === selected.category.id &&
              p.id !== selected.id
          )
        );
      }
    });
  }, [id]);

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1);
      toast.success("Added to cart");
    } catch (err) {
      if (err.message === "LOGIN_REQUIRED") {
        toast.error("Please login to add to cart");
      } else {
        toast.error("Unable to add to cart");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="details">
          <img src={product.imageUrl} alt={product.name} loading="eager" decoding="async" />

          <div className="details-info">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <h3>₹{product.price}</h3>

            <button
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              className="buy-btn"
              onClick={() =>
                navigate("/checkout", { state: { product } })
              }
            >
              Buy Now
            </button>
          </div>
        </div>

        {recommended.length > 0 && (
          <>
            <h3 className="section-title">Recommended Products</h3>

            <div className="grid">
              {recommended.map(r => (
                <div
                  key={r.id}
                  className="card"
                  onClick={() => navigate(`/product/${r.id}`)}
                >
                  <img src={r.imageUrl} alt={r.name} loading="lazy" decoding="async" />
                  <h4>{r.name}</h4>
                  <p>₹{r.price}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
