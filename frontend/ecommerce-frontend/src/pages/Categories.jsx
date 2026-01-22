import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/categories")
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <div className="grid">
        {loading ? (
          // Show skeleton cards while loading
          [...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton-card">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="card"
              onClick={() => navigate(`/categories/${cat.id}`)}
            >
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
