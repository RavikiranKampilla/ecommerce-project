import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { isAuthenticated } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart on mount
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

  // ✅ ADD TO CART (OPTIMISTIC)
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated()) {
      throw new Error("LOGIN_REQUIRED");
    }

    // 🔥 instant UI update
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: Date.now(), // temp id
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
          stock: product.stock,
        },
      ];
    });

    try {
      await api.post("/cart/add", {
        productId: product.id,
        quantity,
      });
    } catch {
      // rollback if API fails
      setCart((prev) =>
        prev.filter((item) => item.productId !== product.id)
      );
    }
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = async (productId) => {
    const backup = cart;

    setCart((prev) =>
      prev.filter((item) => item.productId !== productId)
    );

    try {
      await api.delete(`/cart/remove/${productId}`);
    } catch {
      setCart(backup);
    }
  };

  // ✅ CLEAR CART
  const clearCart = async () => {
    const backup = cart;
    setCart([]);

    try {
      await api.delete("/cart/clear");
    } catch {
      setCart(backup);
    }
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
