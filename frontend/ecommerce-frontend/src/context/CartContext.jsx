import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // 🔹 load cart from backend after login
  useEffect(() => {
    if (!isLoggedIn) {
      setCart([]);
      return;
    }

    api.get("/cart")
      .then((res) => setCart(res.data))
      .catch(() => setCart([]));
  }, [isLoggedIn]);

  const addToCart = async (productId, quantity = 1) => {
    if (!localStorage.getItem("token")) {
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
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
