import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories")
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <div className="grid">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="card"
            onClick={() => navigate(`/categories/${cat.id}`)}
          >
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
