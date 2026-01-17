import { createContext, useContext, useEffect, useState } from "react";
import api from "../api"; // ✅ correct path
import { isAuthenticated } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart whenever user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      setCart([]);
      return;
    }

    api
      .get("/cart")
      .then((res) => setCart(res.data))
      .catch(() => setCart([]));
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      throw new Error("LOGIN_REQUIRED");
    }

    const res = await api.post("/cart/add", {
      productId,
      quantity,
    });

    setCart(res.data);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    setCart(res.data);
  };

  const clearCart = async () => {
    await api.delete("/cart/clear");
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
